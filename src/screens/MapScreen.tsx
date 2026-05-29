import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { MapFiltersPanel } from '../components/MapFiltersPanel';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { StatusCard } from '../components/StatusCard';
import { VoiceAssistantCard } from '../components/VoiceAssistantCard';
import { useMapRouting } from '../context/MapRoutingContext';
import { useAppTheme } from '../hooks/useAppTheme';
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

export function MapScreen({ onOpenDetail, onReport }: Props) {
  const { colors, isHackathon } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceDim }]}>
      <View style={styles.mapArea}>
        <InteractiveMap />

        <View style={styles.uiLayer} pointerEvents="box-none">
          <SearchBar />
          <VoiceAssistantCard />
          {isHackathon ? (
            <View style={styles.filtersWrap}>
              <MapFiltersPanel />
            </View>
          ) : null}
          <RouteLegend />
          <StatusCard onPressVer={onOpenDetail} />
          <ReportFab onPress={onReport} />
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
    top: 120,
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
});
