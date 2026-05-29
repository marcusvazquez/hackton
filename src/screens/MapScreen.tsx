import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapFiltersPanel } from '../components/MapFiltersPanel';
import { MapMarker } from '../components/MapMarker';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { StatusCard } from '../components/StatusCard';
import { VoiceAssistantCard } from '../components/VoiceAssistantCard';
import { MAP_IMAGE, MARKERS } from '../data/markers';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';

type Props = {
  onOpenDetail: () => void;
  onReport: () => void;
};

export function MapScreen({ onOpenDetail, onReport }: Props) {
  const { colors, isHackathon } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceDim }]}>
      <View style={styles.mapArea}>
        <Image
          accessibilityLabel="Mapa de Tijuana con rutas accesibles"
          contentFit="cover"
          source={{ uri: MAP_IMAGE }}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={[
            styles.mapOverlay,
            isHackathon
              ? { backgroundColor: 'rgba(0, 229, 255, 0.06)' }
              : { backgroundColor: 'rgba(0, 63, 135, 0.05)' },
          ]}
        />
        {MARKERS.map((marker, index) => (
          <MapMarker key={marker.id} index={index} marker={marker} />
        ))}
        <SearchBar />
        <VoiceAssistantCard />
        {isHackathon ? (
          <View style={styles.filtersWrap}>
            <MapFiltersPanel />
          </View>
        ) : null}
        <StatusCard onPressVer={onOpenDetail} />
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
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  filtersWrap: {
    position: 'absolute',
    top: 120,
    left: spacing.edge,
    right: spacing.edge,
    zIndex: 15,
  },
});
