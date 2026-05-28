import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapMarker } from '../components/MapMarker';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { StatusCard } from '../components/StatusCard';
import { VoiceAssistantCard } from '../components/VoiceAssistantCard';
import { MAP_IMAGE, MARKERS } from '../data/markers';
import { colors } from '../theme/colors';

type Props = {
  onOpenDetail: () => void;
  onReport: () => void;
};

export function MapScreen({ onOpenDetail, onReport }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <Image
          accessibilityLabel="Mapa de Tijuana con rutas accesibles"
          contentFit="cover"
          source={{ uri: MAP_IMAGE }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.mapOverlay} />
        {MARKERS.map((marker, index) => (
          <MapMarker key={marker.id} index={index} marker={marker} />
        ))}
        <SearchBar />
        <VoiceAssistantCard />
        <StatusCard onPressVer={onOpenDetail} />
        <ReportFab onPress={onReport} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 63, 135, 0.05)',
  },
});
