import React from 'react';
import { StyleSheet, View } from 'react-native';
import { InteractiveMap } from '../components/map/InteractiveMap.web';
import { MapFiltersPanel } from '../components/MapFiltersPanel';
import { MapLocationPrompt } from '../components/MapLocationPrompt';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';

type Props = {
  onOpenDetail: () => void;
  onReport: () => void;
};

/** Mapa web: Leaflet interactivo + búsqueda y ubicación (sin tarjeta de voz). */
export function MapScreen({ onOpenDetail: _onOpenDetail, onReport }: Props) {
  const { colors, isHackathon } = useAppTheme();
  const overlay = useMapOverlayInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceDim }]}>
      <View style={styles.mapArea}>
        <InteractiveMap />
        <SearchBar />
        <MapLocationPrompt />
        {isHackathon ? (
          <View style={[styles.filtersWrap, { top: overlay.filtersTop ?? 120 }]}>
            <MapFiltersPanel />
          </View>
        ) : null}
        <ReportFab onPress={onReport} />
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
  filtersWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
  },
});
