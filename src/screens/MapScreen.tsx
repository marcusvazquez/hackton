import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { MapFiltersPanel } from '../components/MapFiltersPanel';
import { MapLocationPrompt } from '../components/MapLocationPrompt';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { StatusCard } from '../components/StatusCard';
import { VoiceAssistantCard } from '../components/VoiceAssistantCard';
import { useMapRouting } from '../context/MapRoutingContext';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';
import { hackathonTypography } from '../theme/hackathonLayout';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onOpenDetail: () => void;
  onReport: () => void;
};

function RouteLegend() {
  const { colors, fontBold, fontRegular } = useAppTheme();
  const { routeResult, isCalculating, destinationLabel, disabilityProfile } = useMapRouting();

  if (isCalculating) {
    return (
      <View
        style={[
          styles.legend,
          { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[styles.legendTitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Calculando ruta accesible…
        </Text>
      </View>
    );
  }

  if (!routeResult) return null;

  return (
    <View
      style={[
        styles.legend,
        { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
      ]}
    >
      <Text style={[styles.legendTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
        {destinationLabel ?? 'Ruta activa'}
      </Text>
      <View style={styles.legendRow}>
        <View style={[styles.legendSwatch, { backgroundColor: colors.primary }]} />
        <Text style={[styles.legendText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Óptima accesible · {routeResult.primary.durationMin} min · {Math.round(routeResult.primary.distanceM)} m
        </Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendSwatchDashed, { borderColor: colors.onSurfaceVariant }]} />
        <Text style={[styles.legendText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Alternativa · {routeResult.alternative.durationMin} min · score {routeResult.primary.accessibilityScore}
        </Text>
      </View>
      {routeResult.activeHazardZones.length > 0 ? (
        <Text style={[styles.legendHint, { fontFamily: fontRegular, color: colors.secondary }]}>
          {routeResult.activeHazardZones.length} zona(s) de alerta activa(s) en el mapa
        </Text>
      ) : null}
      {disabilityProfile === 'discapacidad_visual' &&
      routeResult.primary.audioGuidance?.length ? (
        <Text style={[styles.legendHint, { fontFamily: fontRegular, color: colors.primary }]}>
          {routeResult.primary.audioGuidance.length} instrucciones de voz paso a paso
        </Text>
      ) : null}
      {disabilityProfile === 'discapacidad_auditiva' &&
      routeResult.primary.visualAlerts?.length ? (
        <Text style={[styles.legendHint, { fontFamily: fontRegular, color: colors.primary }]}>
          {routeResult.primary.visualAlerts.length} alertas visuales y hápticas activas
        </Text>
      ) : null}
    </View>
  );
}

function VisualAlertStrip() {
  const { colors, fontBold, isHackathon, fontNav } = useAppTheme();
  const adaptive = useAdaptiveUI();
  const overlay = useMapOverlayInsets();

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel="Alerta visual: dos barreras reportadas cerca de ti"
      style={[
        styles.alertStrip,
        {
          top: overlay.alertStripTop ?? 8,
          backgroundColor: colors.errorContainer,
          borderColor: colors.error,
          padding: isHackathon ? 8 : 12,
        },
      ]}
    >
      <MaterialIcons name="warning" size={adaptive.largeIcons ? 28 : 22} color={colors.error} />
      <Text
        style={[
          styles.alertText,
          {
            fontFamily: isHackathon ? fontNav : fontBold,
            fontSize: isHackathon ? hackathonTypography.bodySm : adaptive.fontSize,
            color: colors.onErrorContainer,
          },
        ]}
        numberOfLines={2}
      >
        2 barreras cerca — revisa el mapa
      </Text>
    </View>
  );
}

export function MapScreen({ onOpenDetail, onReport }: Props) {
  const { colors, isHackathon, fontBold } = useAppTheme();
  const adaptive = useAdaptiveUI();
  const overlay = useMapOverlayInsets();
  const backgroundColor = adaptive.highContrast ? '#000000' : colors.surfaceDim;

  if (adaptive.simplifiedUI) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.mapArea}>
          <InteractiveMap />
          <View style={styles.uiLayer} pointerEvents="box-none">
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="Ir a destino"
              accessibilityHint="Abre los detalles de la ruta accesible más cercana"
              onPress={onOpenDetail}
              style={[
                styles.goButton,
                {
                  minHeight: adaptive.minTouchTarget,
                  backgroundColor: colors.primary,
                  margin: adaptive.itemSpacing,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fontBold,
                  fontSize: adaptive.fontSize,
                  color: colors.onPrimary,
                }}
              >
                Ir a...
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.mapArea}>
        <InteractiveMap />

        <View style={styles.uiLayer} pointerEvents="box-none">
          {adaptive.showCaptions && !isHackathon ? <VisualAlertStrip /> : null}
          <SearchBar />
          <MapLocationPrompt />
          <VoiceAssistantCard />
          {isHackathon ? (
            <View style={[styles.filtersWrap, { top: overlay.filtersTop ?? 120 }]}>
              <MapFiltersPanel />
            </View>
          ) : null}
          <RouteLegend />
          <StatusCard onPressVer={onOpenDetail} />
          <ReportFab onPress={onReport} size={adaptive.minTouchTarget} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  filtersWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
  },
  legend: {
    position: 'absolute',
    top: 72,
    right: spacing.edge,
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
    zIndex: 18,
    ...shadows.sm,
  },
  legendTitle: {
    fontSize: 13,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 22,
    height: 4,
    borderRadius: 2,
  },
  legendSwatchDashed: {
    width: 22,
    height: 0,
    borderTopWidth: 3,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 11,
    flex: 1,
  },
  legendHint: {
    fontSize: 10,
    marginTop: 2,
  },
  goButton: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  alertStrip: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  alertText: {
    flex: 1,
  },
});
