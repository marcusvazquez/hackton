import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AccessibleMapView } from './AccessibleMapView';

/** Mapa nativo con react-native-maps, rutas accesibles y capas de alerta. */
export function InteractiveMap() {
  return (
    <View style={styles.wrapper}>
      <AccessibleMapView />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
});
