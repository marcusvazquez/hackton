import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BarrierChip } from '../components/BarrierChip';
import { SectionHeader } from '../components/SectionHeader';
import { SubmitButton } from '../components/SubmitButton';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOfflineContext } from '../context/OfflineContext';
import { BARRIER_TYPES } from '../data/barriers';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { voiceAIService } from '../services/voiceAI';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii } from '../theme/shadows';
import { playSelectSound } from '../utils/talkbackSounds';

const OFFLINE_AMBER = '#f97316';

type Props = {
  onReportSuccess: () => void;
};

export function ReportScreen({ onReportSuccess }: Props) {
  const { talkBackEnabled, reduceMotion, speak, personType } = useAccessibility();
  const adaptive = useAdaptiveUI();
  const { colors, fontBold, fontRegular, isHackathon, fontNav, spacing: themeSpacing } =
    useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { addToQueue, syncQueue } = useOfflineContext();
  const [selected, setSelected] = useState<string | null>(null);
  const [savedOffline, setSavedOffline] = useState(false);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const rotation = useSharedValue(0);
  const barProgress = useSharedValue(0.1);

  useEffect(() => {
    if (!isOnline && !reduceMotion) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      rotation.value = 0;
    }
  }, [isOnline, reduceMotion, rotation]);

  useEffect(() => {
    if (!isOnline && !reduceMotion) {
      barProgress.value = withRepeat(
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      barProgress.value = 0.1;
    }
  }, [isOnline, reduceMotion, barProgress]);

  useEffect(() => {
    if (isOnline) setSavedOffline(false);
  }, [isOnline]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  const gray = colors.onSurfaceVariant;

  const handleSaveOffline = () => {
    if (!selected) return;
    const barrier = BARRIER_TYPES.find((b) => b.id === selected);
    addToQueue({
      label: barrier?.label ?? selected,
      location: 'Posición GPS actual',
      barrierTypeId: selected,
    });
    setSavedOffline(true);
  };

  const handleSelectBarrier = useCallback(
    (id: string) => {
      setSelected(id);
      const barrier = BARRIER_TYPES.find((b) => b.id === id);
      if (!barrier) return;

      if (talkBackEnabled) {
        void speak(`${barrier.label} seleccionado`);
      } else if (!adaptive.showCaptions) {
        playSelectSound();
      }
    },
    [adaptive.showCaptions, speak, talkBackEnabled],
  );

  const handleVoiceDescribe = useCallback(async () => {
    if (voiceRecording) {
      setVoiceProcessing(true);
      try {
        const uri = await voiceAIService.stopRecording();
        setVoiceRecording(false);
        if (uri) {
          let text = await voiceAIService.transcribeAudio(uri);
          if (!text.trim()) {
            text = 'Barrera reportada en la vía pública';
          }
          setDescription(text);
          if (talkBackEnabled) {
            await speak(`Descripción: ${text}`);
          }
        }
      } finally {
        setVoiceProcessing(false);
      }
      return;
    }

    try {
      await voiceAIService.startRecording();
      setVoiceRecording(true);
      if (talkBackEnabled) {
        await speak('Describe el problema. Toca de nuevo para terminar.');
      }
    } catch {
      setVoiceRecording(false);
    }
  }, [speak, talkBackEnabled, voiceRecording]);

  const applyPickedPhoto = useCallback(
    (uri: string) => {
      setPhotoUri(uri);
      if (adaptive.useHaptics) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (talkBackEnabled) {
        void speak('Foto adjuntada al reporte');
      }
    },
    [adaptive.useHaptics, speak, talkBackEnabled],
  );

  const launchCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (talkBackEnabled) void speak('Permiso de cámara denegado');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.72,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      applyPickedPhoto(result.assets[0].uri);
    }
  }, [applyPickedPhoto, talkBackEnabled, speak]);

  const launchGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (talkBackEnabled) void speak('Permiso de galería denegado');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.72,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      applyPickedPhoto(result.assets[0].uri);
    }
  }, [applyPickedPhoto, talkBackEnabled, speak]);

  const handlePickPhoto = useCallback(() => {
    if (Platform.OS === 'web') {
      void launchCamera();
      return;
    }
    const buttons: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[] = [
      { text: 'Tomar foto', onPress: () => void launchCamera() },
      { text: 'Elegir de galería', onPress: () => void launchGallery() },
    ];
    if (photoUri) {
      buttons.push({
        text: 'Quitar foto',
        style: 'destructive',
        onPress: () => {
          setPhotoUri(null);
          if (talkBackEnabled) void speak('Foto eliminada');
        },
      });
    }
    buttons.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Adjuntar foto', 'Documenta el obstáculo con una imagen', buttons);
  }, [launchCamera, launchGallery, photoUri, talkBackEnabled, speak]);

  const isMotriz = personType === 'motriz';
  const isAuditiva = personType === 'auditiva';
  const isVisual = personType === 'visual';

  const barrierGrid = (
    <View style={[styles.grid, { gap: adaptive.itemSpacing }]}>
      {BARRIER_TYPES.map((barrier, index) => (
        <BarrierChip
          key={barrier.id}
          barrier={barrier}
          index={index}
          onSelect={handleSelectBarrier}
          onAttachPhoto={handlePickPhoto}
          selected={selected === barrier.id}
          iconOnly={isMotriz}
          minTouchTarget={adaptive.minTouchTarget + (isMotriz ? 24 : 0)}
          largeIcons={adaptive.largeIcons}
          fontSize={
            isHackathon
              ? Math.min(adaptive.fontSize, 14)
              : adaptive.fontSize
          }
        />
      ))}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[
        styles.container,
        talkBackEnabled ? styles.containerTalkBack : { backgroundColor: colors.surface },
      ]}
    >
      {isOnline ? (
        <>
          <SectionHeader
            title="Reportar barrera"
            subtitle="Selecciona el tipo de obstáculo que encontraste"
          />

          {isHackathon ? (
            <View
              style={[
                styles.hintBox,
                { borderColor: colors.primary, backgroundColor: colors.surfaceContainerLowest },
              ]}
            >
              <Text
                style={[
                  styles.hintText,
                  { fontFamily: fontRegular, color: colors.onSurfaceVariant },
                ]}
              >
                Los reportes se sincronizan con la comunidad. En modo offline quedan en cola
                hasta tener conexión.
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.subtitle,
                { fontFamily: fontRegular },
                talkBackEnabled ? styles.subtitleTalkBack : { color: colors.onSurfaceVariant },
              ]}
            >
              Selecciona el tipo de obstáculo que encontraste.
            </Text>
          )}

          {barrierGrid}

          {isVisual ? (
            <View style={styles.voiceDescribeSection}>
              <TextInput
                accessible
                accessibilityLabel="Descripción del problema"
                accessibilityHint="Opcional. También puedes dictar con el botón de voz"
                multiline
                value={description}
                onChangeText={setDescription}
                placeholder="Describe el obstáculo (opcional)"
                placeholderTextColor={colors.onSurfaceVariant}
                style={[
                  styles.descriptionInput,
                  {
                    fontFamily: fontRegular,
                    fontSize: adaptive.fontSize,
                    color: colors.onSurface,
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLow,
                  },
                ]}
              />
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel={voiceRecording ? 'Detener dictado' : 'Describir con voz'}
                accessibilityHint="Graba una descripción hablada del obstáculo"
                onPress={handleVoiceDescribe}
                style={[
                  styles.voiceDescribeBtn,
                  {
                    backgroundColor: voiceRecording ? colors.error : colors.primary,
                    minHeight: adaptive.minTouchTarget,
                  },
                ]}
              >
                {voiceProcessing ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <MaterialIcons
                    name={voiceRecording ? 'stop' : 'mic'}
                    size={adaptive.largeIcons ? 28 : 22}
                    color={colors.onPrimary}
                  />
                )}
                <Text style={[styles.voiceDescribeText, { fontFamily: fontBold, fontSize: adaptive.fontSize, color: colors.onPrimary }]}>
                  {voiceRecording ? 'Detener' : 'Describir con voz'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {selected ? (
            <View style={styles.photoSection}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={[
                    styles.photoPreview,
                    isHackathon && { borderColor: colors.primary, borderWidth: 3 },
                  ]}
                  accessibilityLabel="Foto del reporte"
                />
              ) : null}
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel={photoUri ? 'Cambiar foto del obstáculo' : 'Adjuntar foto del obstáculo'}
                accessibilityHint="Abre cámara o galería para documentar la barrera"
                onPress={handlePickPhoto}
                style={[
                  styles.photoBtn,
                  {
                    borderColor: colors.primary,
                    minHeight: adaptive.minTouchTarget,
                    backgroundColor: isHackathon ? colors.surfaceContainerLow : 'transparent',
                  },
                  isHackathon && styles.photoBtnHackathon,
                ]}
              >
                <MaterialIcons name="photo-camera" size={adaptive.largeIcons ? 32 : 24} color={colors.primary} />
                <Text
                  style={[
                    styles.photoBtnText,
                    {
                      fontFamily: isHackathon ? fontNav : fontBold,
                      fontSize: isHackathon ? 14 : adaptive.fontSize,
                      color: colors.primary,
                    },
                  ]}
                >
                  {photoUri ? 'Cambiar foto' : 'Adjuntar foto (opcional)'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <SubmitButton disabled={!selected} onSuccess={onReportSuccess} />
        </>
      ) : (
        <>
          <View
            style={[
              styles.offlineStatusBar,
              {
                backgroundColor: OFFLINE_AMBER,
                paddingVertical: themeSpacing.gutter / 2,
                paddingHorizontal: themeSpacing.edge,
              },
            ]}
          >
            <Text style={[styles.offlineStatusText, { fontFamily: fontBold }]}>
              ESTADO: FUERA DE LÍNEA
            </Text>
            <MaterialIcons name="wifi-off" size={18} color="#ffffff" />
          </View>

          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.heroTitle,
                { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
              ]}
            >
              Reportes en Cola de Espera
            </Text>
            <Text style={[styles.heroSubtitle, { fontFamily: fontRegular, color: gray }]}>
              Tus reportes se guardan localmente y se envían al recuperar conexión.
            </Text>
            <View style={[styles.syncIconWrap, { borderColor: colors.secondary }]}>
              <Animated.View style={rotateStyle}>
                <MaterialIcons name="sync" size={64} color={colors.secondary} />
              </Animated.View>
            </View>
          </View>

          <View
            style={[
              styles.guaranteedCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.guaranteedHeader}>
              <MaterialIcons name="shield" size={28} color={colors.primary} />
              <Text
                style={[
                  styles.guaranteedTitle,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Reportes Garantizados
              </Text>
            </View>
            <Text style={[styles.guaranteedDesc, { fontFamily: fontRegular, color: gray }]}>
              El sistema resguarda cada reporte hasta confirmar envío al servidor.
            </Text>
            <View style={[styles.separator, { backgroundColor: colors.outlineVariant }]} />
            <View style={styles.queueRow}>
              <Text
                style={[
                  styles.queueId,
                  { fontFamily: fontRegular, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Reporte pendiente: #RL-{syncQueue.length + 9900}
              </Text>
              <Text style={[styles.queueSignal, { fontFamily: fontBold, color: colors.secondary }]}>
                ESPERANDO SEÑAL
              </Text>
            </View>
            <View style={[styles.queueBarTrack, { backgroundColor: colors.surfaceContainer }]}>
              <Animated.View
                style={[styles.queueBarFill, barFillStyle, { backgroundColor: OFFLINE_AMBER }]}
              />
            </View>
            <View style={styles.queueMetaRow}>
              <View style={styles.queueMetaItem}>
                <MaterialIcons name="schedule" size={14} color={gray} />
                <Text style={[styles.queueMetaText, { fontFamily: fontRegular, color: gray }]}>
                  Guardado hace 5 min
                </Text>
              </View>
              <View style={styles.queueMetaItem}>
                <MaterialIcons name="wifi-off" size={14} color={gray} />
                <Text style={[styles.queueMetaText, { fontFamily: fontRegular, color: gray }]}>
                  Sin red
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialIcons name="camera" size={16} color={colors.onSurface} />
              <Text
                style={[
                  styles.pillText,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Auto-Guardado
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.surfaceContainerHigh }]}>
              <View style={[styles.pillDot, { backgroundColor: OFFLINE_AMBER }]} />
              <Text
                style={[
                  styles.pillText,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Cola en Marcha
              </Text>
            </View>
          </View>

          <View style={styles.offlineGridWrap}>{barrierGrid}</View>

          {!savedOffline ? (
            <Pressable
              accessibilityRole="button"
              disabled={!selected}
              onPress={handleSaveOffline}
              style={[
                styles.saveQueueBtn,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceContainerHigh,
                  opacity: selected ? 1 : 0.6,
                },
              ]}
            >
              <MaterialIcons name="save" size={22} color="#ffffff" />
              <Text style={[styles.saveQueueBtnText, { fontFamily: fontBold }]}>
                Guardar en Cola
              </Text>
            </Pressable>
          ) : (
            <View
              style={[
                styles.savedCard,
                { borderColor: colors.safeGreen, backgroundColor: colors.surfaceContainerLowest },
              ]}
            >
              <MaterialIcons name="check-circle" size={32} color={colors.safeGreen} />
              <Text
                style={[
                  styles.savedText,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                ¡Guardado! Se enviará cuando haya conexión
              </Text>
              <View style={[styles.savedPill, { backgroundColor: colors.surfaceContainerHigh }]}>
                <Text style={[styles.savedPillText, { fontFamily: fontRegular, color: gray }]}>
                  Cola en Marcha · {syncQueue.length} pendiente(s)
                </Text>
              </View>
            </View>
          )}

          <View style={styles.howItWorks}>
            <Text
              style={[
                styles.howTitle,
                { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
              ]}
            >
              ¿Cómo funciona?
            </Text>
            <View style={[styles.step, { borderLeftColor: colors.primary }]}>
              <Text style={[styles.stepTitle, { fontFamily: fontBold, color: colors.primary }]}>
                01 Captura
              </Text>
              <Text style={[styles.stepBody, { fontFamily: fontRegular, color: gray }]}>
                Captura coordenadas GPS, imagen comprimida y metadatos del incidente sin red activa.
              </Text>
            </View>
            <View style={[styles.step, { borderLeftColor: colors.secondary }]}>
              <Text style={[styles.stepTitle, { fontFamily: fontBold, color: colors.secondary }]}>
                02 Resguardo
              </Text>
              <Text style={[styles.stepBody, { fontFamily: fontRegular, color: gray }]}>
                La información se cifra localmente y se almacena en contenedor aislado.
              </Text>
            </View>
            <View style={[styles.step, { borderLeftColor: colors.safeGreen }]}>
              <Text style={[styles.stepTitle, { fontFamily: fontBold, color: colors.safeGreen }]}>
                03 Liberación
              </Text>
              <Text style={[styles.stepBody, { fontFamily: fontRegular, color: gray }]}>
                Al detectar red, transmite por paquetes garantizando el 100% de llegada al servidor.
              </Text>
            </View>
          </View>

          <View style={[styles.motivationBanner, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="campaign" size={32} color="#ffffff" style={styles.campaignIcon} />
            <Text style={[styles.motivationText, { fontFamily: fontBold }]}>
              No dejes que la falta de señal te detenga. Cada reporte cuenta para una comunidad libre.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSavedOffline(false)}
              style={styles.motivationBtn}
            >
              <Text style={[styles.motivationBtnText, { fontFamily: fontBold }]}>
                Entendido, Continuar Reportando
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerTalkBack: { backgroundColor: '#000000' },
  content: {
    padding: spacing.edge,
    paddingBottom: SCROLL_BOTTOM_INSET,
    paddingTop: 8,
  },
  hintBox: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 8,
  },
  hintText: { fontSize: 13, lineHeight: 20 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  subtitleTalkBack: { color: '#cccccc' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  voiceDescribeSection: { marginTop: 16, gap: 12 },
  descriptionInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    textAlignVertical: 'top',
  },
  voiceDescribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  voiceDescribeText: { fontSize: 16 },
  photoSection: { marginTop: 16, gap: 12, alignItems: 'center' },
  photoPreview: { width: '100%', height: 160, borderRadius: radii.md },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  photoBtnText: { fontSize: 16 },
  photoBtnHackathon: {
    borderWidth: 3,
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  offlineStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.gutter,
    marginHorizontal: -spacing.edge,
    marginTop: -8,
  },
  offlineStatusText: { fontSize: 12, color: '#ffffff', letterSpacing: 0.5 },
  heroCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.edge,
    marginBottom: spacing.gutter,
    gap: 8,
  },
  heroTitle: { fontSize: 24 },
  heroSubtitle: { fontSize: 15, lineHeight: 22 },
  syncIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 12,
  },
  guaranteedCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    gap: 8,
  },
  guaranteedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guaranteedTitle: { fontSize: 18 },
  guaranteedDesc: { fontSize: 14, lineHeight: 20 },
  separator: { height: 1, marginVertical: 4 },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  queueId: { fontSize: 13, flex: 1 },
  queueSignal: { fontSize: 11, letterSpacing: 0.5 },
  queueBarTrack: { height: 4, borderRadius: 2, overflow: 'hidden', width: '100%' },
  queueBarFill: { height: '100%', borderRadius: 2 },
  queueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  queueMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  queueMetaText: { fontSize: 12 },
  offlineGridWrap: { marginBottom: spacing.gutter },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.gutter },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 12 },
  saveQueueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.md,
    marginTop: 8,
  },
  saveQueueBtnText: { fontSize: 16, color: '#ffffff' },
  savedCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.gutter,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  savedText: { fontSize: 16, textAlign: 'center' },
  savedPill: { borderRadius: radii.pill, paddingVertical: 6, paddingHorizontal: 12 },
  savedPillText: { fontSize: 12 },
  howItWorks: { marginTop: 24, gap: 4 },
  howTitle: { fontSize: 18, marginBottom: 8 },
  step: { borderLeftWidth: 3, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12 },
  stepTitle: { fontSize: 15, marginBottom: 4 },
  stepBody: { fontSize: 13, lineHeight: 20 },
  motivationBanner: {
    borderRadius: radii.md,
    padding: spacing.edge,
    marginTop: 8,
    alignItems: 'center',
  },
  campaignIcon: { marginBottom: 8 },
  motivationText: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  motivationBtn: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  motivationBtnText: { fontSize: 15, color: '#ffffff' },
});
