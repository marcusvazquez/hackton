import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii } from '../theme/shadows';

const OFFLINE_AMBER = '#f97316';

type Props = {
  onReportSuccess: () => void;
};

export function ReportScreen({ onReportSuccess }: Props) {
  const { talkBackEnabled, reduceMotion } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { addToQueue, syncQueue } = useOfflineContext();
  const [selected, setSelected] = useState<string | null>(null);
  const [savedOffline, setSavedOffline] = useState(false);
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
  const pendingCount = syncQueue.filter((item) => item.status === 'pending').length;

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

  const barrierGrid = (
    <View style={styles.grid}>
      {BARRIER_TYPES.map((barrier, index) => (
        <BarrierChip
          key={barrier.id}
          barrier={barrier}
          index={index}
          onSelect={setSelected}
          selected={selected === barrier.id}
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

          {isHackathon && !talkBackEnabled ? (
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

          <SubmitButton disabled={!selected} onSuccess={onReportSuccess} />
        </>
      ) : (
        <>
          <View style={styles.offlineStatusBar}>
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
              <MaterialIcons name="photo-camera" size={16} color={colors.onSurface} />
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
                  Cola en Marcha · {pendingCount} pendiente(s)
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
                Captura coordenadas GPS, imagen comprimida y metadatos del incidente sin red
                activa.
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
              <Text
                style={[styles.stepTitle, { fontFamily: fontBold, color: colors.safeGreen }]}
              >
                03 Liberación
              </Text>
              <Text style={[styles.stepBody, { fontFamily: fontRegular, color: gray }]}>
                Al detectar red, transmite por paquetes garantizando el 100% de llegada al
                servidor.
              </Text>
            </View>
          </View>

          <View style={[styles.motivationBanner, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="campaign" size={32} color="#ffffff" style={styles.campaignIcon} />
            <Text style={[styles.motivationText, { fontFamily: fontBold }]}>
              No dejes que la falta de señal te detenga. Cada reporte cuenta para una comunidad
              libre.
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
  container: {
    flex: 1,
  },
  containerTalkBack: {
    backgroundColor: '#000000',
  },
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
  hintText: {
    fontSize: 13,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  offlineStatusBar: {
    backgroundColor: OFFLINE_AMBER,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.gutter,
    marginHorizontal: -spacing.edge,
    marginTop: -8,
  },
  offlineStatusText: {
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.edge,
    marginBottom: spacing.gutter,
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  syncIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 12,
  },
  guaranteedCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    gap: 8,
  },
  guaranteedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guaranteedTitle: {
    fontSize: 18,
  },
  guaranteedDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  queueId: {
    fontSize: 13,
    flex: 1,
  },
  queueSignal: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  queueBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  queueBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  queueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  queueMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  queueMetaText: {
    fontSize: 12,
  },
  offlineGridWrap: {
    marginBottom: spacing.gutter,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.gutter,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 12,
  },
  saveQueueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.md,
    marginTop: 8,
  },
  saveQueueBtnText: {
    fontSize: 16,
    color: '#ffffff',
  },
  savedCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.gutter,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  savedText: {
    fontSize: 16,
    textAlign: 'center',
  },
  savedPill: {
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  savedPillText: {
    fontSize: 12,
  },
  howItWorks: {
    marginTop: 24,
    gap: 4,
  },
  howTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  step: {
    borderLeftWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  stepBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  motivationBanner: {
    borderRadius: radii.md,
    padding: spacing.edge,
    marginTop: 8,
    alignItems: 'center',
  },
  campaignIcon: {
    marginBottom: 8,
  },
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
  motivationBtnText: {
    fontSize: 15,
    color: '#ffffff',
  },
});
