import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from '../lib/expoCamera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Accelerometer } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { useProximityHaptics } from '../hooks/useProximityHaptics';
import {
  adjustDistanceForPersonType,
  estimateDistanceMetersFromScan,
} from '../utils/proximityDistance';
import { useAppTheme } from '../hooks/useAppTheme';
import { hackathonColors } from '../theme/hackathonColors';
import { hackathonNeonText, hackathonTypography } from '../theme/hackathonLayout';
import {
  analyzeEnvironmentFrame,
  analyzeGuidedEnvironmentFrame,
  EnvironmentScanResult,
} from '../services/environmentVision';
import { radii, glass } from '../theme/shadows';
import { uriToImageAttachment } from '../utils/imageAttachment';
import { speakMessage } from '../utils/playGeneratedAudio';

export type ScannerMode = 'scan' | 'guided';

type Props = {
  mode?: ScannerMode;
  onClose: () => void;
};

const SCAN_INTERVAL_MS = 1500;
/** Guía en vivo: menos capturas para no saturar Gemini ni la voz */
const GUIDED_INTERVAL_MS = 2800;
const WEB_CAMERA_WARMUP_MS = 1200;
const CAMERA_START_DELAY_MS = Platform.OS === 'web' ? 900 : 400;
const MAX_CAPTURE_ATTEMPTS = 4;
const FAILURES_BEFORE_ERROR = 3;
const MAX_ACCELERATION_G = 1.2; // Sensibilidad de movimiento para estabilización
const REQUIRED_CONSECUTIVE_DETECTIONS = 2; // Debounce de objetos estables

export function EnvironmentScanner({ mode = 'scan', onClose }: Props) {
  const { colors, isHackathon, fontBold, fontRegular, fontNav } = useAppTheme();
  const { speak, talkBackEnabled, personType } = useAccessibility();
  const { useHaptics: adaptiveHaptics } = useAdaptiveUI();
  const shouldVibrate =
    adaptiveHaptics || personType === 'visual' || talkBackEnabled;

  const proximityHapticsEnabled =
    Platform.OS !== 'web' &&
    shouldVibrate &&
    (personType === 'visual' ||
      personType === 'motriz' ||
      personType === 'auditiva' ||
      personType === 'cognitiva');

  const { updateDistance } = useProximityHaptics(proximityHapticsEnabled);

  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState('Preparando cámara…');
  const [analyzing, setAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<EnvironmentScanResult | null>(null);
  /** Solo escaneo puntual en web sin cámara en vivo — nunca en modo guía */
  const [webFallback, setWebFallback] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const analyzingRef = useRef(false);
  const lastAlertRef = useRef('');
  const lastDetectedObjectsRef = useRef<string>('');
  const consecutiveDetectionCountRef = useRef(0);
  const failuresRef = useRef(0);
  const scanLineY = useSharedValue(0);
  const currentAccelerationRef = useRef(0);

  const isGuided = mode === 'guided';
  const title = isGuided ? 'Guía IA en vivo' : 'Escáner de entorno';
  const liveCameraReady = Boolean(permission?.granted);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(withTiming(220, { duration: 1400 }), withTiming(0, { duration: 1400 })),
      -1,
      true,
    );
  }, [scanLineY]);

  // Suscripción al acelerómetro para estabilización de imagen
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    if (Platform.OS !== 'web') {
      Accelerometer.setUpdateInterval(150);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        // Vector de aceleración (restando la gravedad aproximada 1G)
        const gForce = Math.sqrt(x * x + y * y + z * z);
        currentAccelerationRef.current = gForce;
      });
    }
    return () => subscription?.remove();
  }, []);

  const announceResult = useCallback(
    (result: EnvironmentScanResult) => {
      // Filtro de entorno dinámico: sólo notifica objetos si son "estables" en 2 frames seguidos
      const currentObjects = result.objects.slice().sort().join(',');
      let isStable = true;
      
      if (currentObjects && currentObjects !== lastDetectedObjectsRef.current) {
        lastDetectedObjectsRef.current = currentObjects;
        consecutiveDetectionCountRef.current = 1;
        isStable = false; // Ignora en el primer frame nuevo
      } else if (currentObjects) {
        consecutiveDetectionCountRef.current += 1;
        if (consecutiveDetectionCountRef.current < REQUIRED_CONSECUTIVE_DETECTIONS) {
          isStable = false;
        }
      } else {
        lastDetectedObjectsRef.current = '';
        consecutiveDetectionCountRef.current = 0;
      }

      setLastResult(result);
      // Mantenemos el estado visible aunque no hable todavía para feedback visual
      setStatus(result.alertMessage);

      const meters = estimateDistanceMetersFromScan(result);
      updateDistance(adjustDistanceForPersonType(meters, personType));

      const shouldSpeak =
        isStable &&
        (isGuided ||
          talkBackEnabled ||
          personType === 'visual' ||
          (result.hazardLevel !== 'none' && personType !== 'cognitiva'));

      if (shouldSpeak && result.alertMessage !== lastAlertRef.current) {
        lastAlertRef.current = result.alertMessage;
        if (talkBackEnabled) {
          void speak(result.alertMessage);
        } else {
          void speakMessage(result.alertMessage);
        }
      }
    },
    [isGuided, personType, speak, talkBackEnabled, updateDistance],
  );

  const capturePhotoBase64 = useCallback(async (): Promise<string | null> => {
    const cam = cameraRef.current;
    if (!cam?.takePictureAsync) return null;

    for (let attempt = 0; attempt < MAX_CAPTURE_ATTEMPTS; attempt++) {
      try {
        const photo = await cam.takePictureAsync({
          base64: true,
          quality: Platform.OS === 'web' ? 0.55 : 0.72,
          skipProcessing: Platform.OS !== 'ios',
        });
        if (photo?.base64 && photo.base64.length > 100) {
          let b64 = photo.base64;
          if (b64.startsWith('data:')) {
            const comma = b64.indexOf(',');
            if (comma >= 0) b64 = b64.slice(comma + 1);
          }
          return b64.replace(/\s/g, '');
        }
      } catch {
        // Reintento: en web la cámara a veces aún no entrega frames estables.
      }
      if (attempt < MAX_CAPTURE_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, 280 + attempt * 120));
      }
    }
    return null;
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (analyzingRef.current) return;

    // Filtro de nitidez (estabilidad)
    if (Platform.OS !== 'web') {
      const gForce = currentAccelerationRef.current;
      // Si el teléfono se está moviendo bruscamente (>1.2G o muy bajo), no capturamos
      if (Math.abs(gForce - 1) > MAX_ACCELERATION_G - 1) {
        setStatus('Estabiliza tu teléfono…');
        return;
      }
    }

    analyzingRef.current = true;
    setAnalyzing(true);
    setStatus(isGuided ? 'Analizando tu camino…' : 'Escaneando…');

    try {
      let attachment;
      if (webFallback && !isGuided) {
        const pick = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.72,
          allowsEditing: false,
        });
        if (pick.canceled || !pick.assets[0]?.uri) {
          setStatus('Captura cancelada.');
          return;
        }
        attachment = await uriToImageAttachment(pick.assets[0].uri);
      } else {
        if (!cameraReady) {
          setStatus('Calibrando cámara…');
          return;
        }
        const base64 = await capturePhotoBase64();
        if (!base64) {
          failuresRef.current += 1;
          setStatus(
            failuresRef.current >= FAILURES_BEFORE_ERROR
              ? isGuided
                ? 'No se pudo capturar desde la cámara. Revisa permisos o recarga la página.'
                : 'No se pudo capturar la imagen. Intenta de nuevo.'
              : 'Esperando imagen de la cámara…',
          );
          return;
        }
        failuresRef.current = 0;
        attachment = {
          base64,
          mimeType: 'image/jpeg',
        };
      }

      const result = isGuided
        ? await analyzeGuidedEnvironmentFrame(attachment)
        : await analyzeEnvironmentFrame(attachment, mode);
      announceResult(result);
      failuresRef.current = 0;
    } catch (error) {
      console.warn('[EnvironmentScanner] Error in captureAndAnalyze:', error);
      failuresRef.current += 1;
      if (failuresRef.current >= FAILURES_BEFORE_ERROR) {
        const backoffWait = failuresRef.current * 1000;
        setStatus('Error al analizar. Reintentando…');
        if (shouldVibrate) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        // Espera de backoff exponencial en caso de fallo continuo
        await new Promise((res) => setTimeout(res, backoffWait));
      } else {
        setStatus(isGuided ? 'Reintentando análisis…' : 'Ajustando escaneo…');
      }
    } finally {
      analyzingRef.current = false;
      setAnalyzing(false);
    }
  }, [
    announceResult,
    cameraReady,
    capturePhotoBase64,
    isGuided,
    mode,
    shouldVibrate,
    webFallback,
  ]);

  useEffect(() => {
    void (async () => {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          if (isGuided) {
            setStatus(
              Platform.OS === 'web'
                ? 'Para la guía en vivo necesitas permitir la cámara en el navegador (no se abrirá la app de fotos). Toca Permitir cámara y acepta en la barra de direcciones.'
                : 'Se necesita permiso de cámara para la guía en vivo.',
            );
            setWebFallback(false);
            return;
          }
          setStatus(
            Platform.OS === 'web'
              ? 'Permite el acceso a la cámara en la barra del navegador para escaneo en vivo.'
              : 'Se necesita permiso de cámara para detectar obstáculos.',
          );
          if (Platform.OS === 'web') {
            setWebFallback(true);
          }
          return;
        }
      }

      setWebFallback(false);

      const intro = isGuided
        ? 'Guía en vivo activada. Apunta el teléfono al frente. Te diré si debes girar o seguir recto.'
        : 'Escáner activado. Mueve el dispositivo lentamente hacia adelante.';
      setStatus(intro);
      if (talkBackEnabled) {
        void speak(intro);
      } else if (isGuided || personType === 'visual' || Platform.OS === 'web') {
        void speakMessage(intro);
      }
    })();
  }, [isGuided, permission?.granted, personType, requestPermission, speak, talkBackEnabled]);

  useEffect(() => {
    if (!liveCameraReady) {
      setCameraReady(false);
      failuresRef.current = 0;
      return;
    }
    if (!webFallback && !cameraReady) return;

    const startDelay = cameraReady ? CAMERA_START_DELAY_MS : WEB_CAMERA_WARMUP_MS;

    const interval = setInterval(() => {
      void captureAndAnalyze();
    }, isGuided ? GUIDED_INTERVAL_MS : SCAN_INTERVAL_MS);

    const kickoff = setTimeout(() => void captureAndAnalyze(), startDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(kickoff);
    };
  }, [cameraReady, captureAndAnalyze, isGuided, liveCameraReady, webFallback]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const titleFont = isHackathon ? fontNav : fontBold;
  const bodyFont = isHackathon ? fontRegular : fontRegular;

  const showLiveCamera = liveCameraReady;
  const showManualCaptureFallback = webFallback && !isGuided;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
      <View style={[styles.container, { backgroundColor: isHackathon ? glass.dark : glass.light }]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { fontFamily: titleFont, color: colors.onSurface },
              isHackathon && styles.titleHackathon,
              isHackathon && hackathonNeonText(hackathonColors.primary),
            ]}
          >
            {title}
          </Text>
          <Pressable onPress={onClose} accessibilityLabel="Cerrar escáner" hitSlop={10}>
            <MaterialIcons name="close" size={28} color={colors.onSurface} />
          </Pressable>
        </View>

        <View style={[styles.viewport, { borderColor: colors.primary }]}>
          {!showLiveCamera ? (
            <View style={styles.permissionBox}>
              <MaterialIcons
                name={isGuided ? 'visibility' : 'videocam-off'}
                size={48}
                color={colors.onSurfaceVariant}
              />
              <Text style={[styles.permissionText, { fontFamily: bodyFont, color: colors.onSurfaceVariant }]}>
                {status}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void requestPermission()}
                style={[styles.permissionBtn, { borderColor: colors.primary }]}
              >
                <Text style={[styles.permissionBtnText, { fontFamily: titleFont, color: colors.primary }]}>
                  Permitir cámara
                </Text>
              </Pressable>
              {showManualCaptureFallback ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void captureAndAnalyze()}
                  style={[
                    styles.permissionBtn,
                    { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
                  ]}
                >
                  <Text style={[styles.permissionBtnText, { fontFamily: titleFont, color: colors.primary }]}>
                    Capturar una foto
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
                onCameraReady={() => {
                  setCameraReady(true);
                  setStatus(
                    isGuided
                      ? 'Cámara lista. Apunta el teléfono al frente.'
                      : 'Cámara lista. Mueve el dispositivo lentamente.',
                  );
                }}
              />
              <Animated.View
                style={[
                  styles.scanLine,
                  { backgroundColor: isHackathon ? colors.secondary : colors.primary },
                  scanLineStyle,
                ]}
              />
              {analyzing ? (
                <View style={styles.analyzingBadge}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[styles.analyzingText, { fontFamily: bodyFont, color: colors.onSurface }]}>
                    {isGuided ? 'Gemini analizando…' : 'IA analizando…'}
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.statusText, { fontFamily: bodyFont, color: colors.onSurface }]}>
            {status}
          </Text>
          {lastResult?.objects.length ? (
            <Text style={[styles.objectsText, { fontFamily: bodyFont, color: colors.onSurfaceVariant }]}>
              Detectado: {lastResult.objects.join(', ')}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  container: {
    width: '90%',
    maxWidth: 420,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    flex: 1,
    paddingRight: 8,
  },
  titleHackathon: {
    fontSize: hackathonTypography.sectionTitle,
    lineHeight: hackathonTypography.lineBody,
    letterSpacing: 1,
  },
  viewport: {
    height: 260,
    borderWidth: 2,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
    shadowColor: '#00fbfb',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  analyzingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    zIndex: 11,
  },
  analyzingText: {
    fontSize: 14,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionBtn: {
    borderWidth: 2,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  permissionBtnText: {
    fontSize: 12,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  objectsText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
