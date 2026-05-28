import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { MapMarkerData } from '../data/markers';
import { useAnimations } from '../hooks/useAnimations';
import { colors } from '../theme/colors';
import { PulseRing } from './PulseRing';

type Props = {
  marker: MapMarkerData;
  index: number;
};

function markerColors(type: MapMarkerData['type']) {
  switch (type) {
    case 'safe':
      return { bg: colors.safeGreen, text: '#ffffff', labelBg: '#ffffff', labelText: colors.safeGreen };
    case 'barrier':
      return {
        bg: colors.secondaryContainer,
        text: colors.onSecondaryContainer,
        labelBg: colors.secondaryFixed,
        labelText: colors.onSecondaryFixed,
      };
    case 'barrier-critical':
      return {
        bg: colors.error,
        text: colors.onError,
        labelBg: colors.errorContainer,
        labelText: colors.onErrorContainer,
      };
    default:
      return {
        bg: colors.surfaceContainerHigh,
        text: colors.tertiary,
        labelBg: 'transparent',
        labelText: colors.tertiaryFixedDim,
      };
  }
}

export function MapMarker({ marker, index }: Props) {
  const { markerEnter } = useAnimations();
  const palette = markerColors(marker.type);
  const isPoi = marker.type === 'poi';
  const pulseVariant = marker.type === 'safe' ? 'safe' : 'barrier';

  const content = (
    <Animated.View
      entering={markerEnter(index)}
      style={[
        styles.marker,
        {
          top: marker.top as `${number}%`,
          left: marker.left as `${number}%`,
          opacity: isPoi ? 0.6 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: palette.bg,
            width: isPoi ? 28 : 40,
            height: isPoi ? 28 : 40,
            borderRadius: isPoi ? 999 : 12,
          },
        ]}
      >
        <MaterialIcons
          name={marker.icon as keyof typeof MaterialIcons.glyphMap}
          size={isPoi ? 14 : 22}
          color={palette.text}
        />
      </View>
      <View
        style={[
          styles.label,
          {
            backgroundColor: palette.labelBg,
            borderWidth: isPoi ? 0 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.labelText,
            {
              color: palette.labelText,
              fontSize: isPoi ? 8 : 10,
            },
          ]}
        >
          {marker.label}
        </Text>
      </View>
    </Animated.View>
  );

  if (marker.type === 'safe' || marker.type === 'barrier' || marker.type === 'barrier-critical') {
    return <PulseRing variant={pulseVariant}>{content}</PulseRing>;
  }

  return content;
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderColor: colors.outlineVariant,
  },
  labelText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
