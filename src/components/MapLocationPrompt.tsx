import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMapLocation } from '../context/MapLocationContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';
import { spacing } from '../theme/colors';
import { hackathonTypography } from '../theme/hackathonLayout';
import { radii, shadows } from '../theme/shadows';

/**
 * Solicita ubicación al abrir el mapa y muestra un aviso si falta permiso.
 */
export function MapLocationPrompt() {
  const { userLocation, locationError, locationLoading, locateUser, clearLocationError } =
    useMapLocation();
  const { colors, fontBold, fontRegular, isHackathon, fontNav } = useAppTheme();
  const overlay = useMapOverlayInsets();
  const askedOnMount = useRef(false);

  useEffect(() => {
    if (askedOnMount.current || userLocation) return;
    askedOnMount.current = true;
    void locateUser().catch(() => {});
  }, [locateUser, userLocation]);

  if (userLocation && !locationError) {
    return null;
  }

  const handlePress = () => {
    clearLocationError();
    void locateUser().catch(() => {});
  };

  const titleFont = isHackathon ? fontNav : fontBold;
  const bodyFont = isHackathon ? fontNav : fontRegular;
  const bodyText = locationError
    ? isHackathon
      ? 'Sin GPS — toca Permitir'
      : locationError
    : isHackathon
      ? 'Centra el mapa en tu ubicación.'
      : 'Permite el acceso a tu ubicación para centrar el mapa y sugerir rutas accesibles en Tijuana.';

  return (
    <View
      style={[
        styles.banner,
        shadows.md,
        {
          top: overlay.locationTop ?? 72,
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.outlineVariant,
          padding: isHackathon ? 8 : 12,
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <MaterialIcons
        name={locationError ? 'location-off' : 'near-me'}
        size={isHackathon ? 20 : 22}
        color={locationError ? colors.error : colors.primary}
      />
      <View style={styles.textCol}>
        {!isHackathon ? (
          <Text
            style={[styles.title, { fontFamily: titleFont, color: colors.onSurface }]}
            numberOfLines={1}
          >
            Rutas accesibles cerca de ti
          </Text>
        ) : null}
        <Text
          style={[
            styles.body,
            {
              fontFamily: bodyFont,
              color: colors.onSurfaceVariant,
              fontSize: isHackathon ? hackathonTypography.bodyXs : 12,
              lineHeight: isHackathon ? hackathonTypography.lineBodySm : 16,
            },
          ]}
          numberOfLines={2}
        >
          {bodyText}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Permitir ubicación y centrar mapa"
        disabled={locationLoading}
        onPress={handlePress}
        style={[
          styles.btn,
          {
            backgroundColor: colors.primary,
            paddingHorizontal: isHackathon ? 10 : 14,
            paddingVertical: isHackathon ? 8 : 10,
            minWidth: isHackathon ? 64 : 72,
          },
        ]}
      >
        {locationLoading ? (
          <ActivityIndicator color={colors.onPrimary} size="small" />
        ) : (
          <Text
            style={[
              styles.btnText,
              {
                fontFamily: isHackathon ? fontNav : fontBold,
                color: colors.onPrimary,
                fontSize: isHackathon ? hackathonTypography.bodyXs : 13,
              },
            ]}
            numberOfLines={1}
          >
            Permitir
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.edge,
    right: spacing.edge,
    zIndex: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    minWidth: 72,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 13,
  },
});
