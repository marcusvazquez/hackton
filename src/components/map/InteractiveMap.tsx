import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapMarker } from '../MapMarker';
import { MAP_IMAGE, MARKERS } from '../../data/markers';
import { useAppTheme } from '../../hooks/useAppTheme';

/** Respaldo nativo: imagen estática con marcadores posicionados (sin Leaflet). */
export function InteractiveMap() {
  const { isHackathon } = useAppTheme();

  return (
    <View style={styles.wrapper}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
