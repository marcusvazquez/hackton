import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useMapLocation } from '../context/MapLocationContext';
import { useMapRouting } from '../context/MapRoutingContext';
import { SEARCH_SUGGESTIONS } from '../data/markers';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

export function SearchBar() {
  const { reduceMotion } = useAccessibility();
  const { colors, glass, fontRegular } = useAppTheme();
  const { geocodeAndFly, locateUser, locationLoading } = useMapLocation();
  const { calculateRouteTo, isCalculating } = useMapRouting();
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const borderProgress = useSharedValue(0);
  const scale = useSharedValue(1);
  const placeholderX = useSharedValue(0);
  const placeholderOpacity = useSharedValue(1);

  const suggestions =
    query.length > 0
      ? SEARCH_SUGGESTIONS.filter((s) =>
          s.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  useEffect(() => {
    if (reduceMotion) return;

    borderProgress.value = withTiming(focused ? 1 : 0, { duration: 200 });
    scale.value = withTiming(focused ? 1.01 : 1, { duration: 150 });

    if (focused) {
      placeholderX.value = withTiming(4, { duration: 150 }, () => {
        placeholderOpacity.value = withTiming(0, { duration: 150 });
      });
    } else {
      placeholderOpacity.value = withTiming(1, { duration: 150 });
      placeholderX.value = withTiming(0, { duration: 150 });
    }
  }, [focused, reduceMotion, borderProgress, scale, placeholderX, placeholderOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: reduceMotion
      ? colors.outlineVariant
      : borderProgress.value > 0.5
        ? colors.primary
        : colors.outlineVariant,
  }));

  const placeholderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: placeholderX.value }],
    opacity: placeholderOpacity.value,
  }));

  const handleSelectSuggestion = async (item: string) => {
    setQuery(item);
    setFocused(false);
    await Promise.all([geocodeAndFly(item), calculateRouteTo(item)]);
  };

  const handleLocatePress = async () => {
    try {
      await locateUser();
    } catch {
      // error surfaced via context if needed
    }
  };

  const handleSearchSubmit = async () => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    await Promise.all([geocodeAndFly(trimmed), calculateRouteTo(trimmed)]);
    setFocused(false);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: glass.light },
          containerStyle,
        ]}
      >
        <Pressable
          accessibilityLabel="Centrar mapa en mi ubicación"
          accessibilityRole="button"
          disabled={locationLoading || isCalculating}
          onPress={handleLocatePress}
          style={styles.leadingIcon}
        >
          {locationLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <MaterialIcons name="my-location" size={24} color={colors.primary} />
          )}
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            accessibilityLabel="Buscar destino"
            onBlur={() => setFocused(false)}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onSubmitEditing={handleSearchSubmit}
            placeholder=""
            returnKeyType="search"
            style={[styles.input, { fontFamily: fontRegular, color: colors.onSurface }]}
            value={query}
          />
          {!query && (
            <Animated.Text
              pointerEvents="none"
              style={[styles.placeholder, { fontFamily: fontRegular, color: colors.outline }, placeholderStyle]}
            >
              ¿A dónde vas?
            </Animated.Text>
          )}
        </View>
        <Pressable accessibilityLabel="Búsqueda por voz" style={styles.iconBtn}>
          <MaterialIcons name="mic" size={24} color={colors.primary} />
        </Pressable>
        <Pressable
          accessibilityLabel="Buscar y centrar destino en el mapa"
          onPress={handleSearchSubmit}
          style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="directions" size={24} color={colors.onPrimary} />
        </Pressable>
      </Animated.View>

      {focused && suggestions.length > 0 && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(250).easing(Easing.out(Easing.quad))}
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {suggestions.map((item, index) => (
            <Animated.View
              key={item}
              entering={
                reduceMotion
                  ? undefined
                  : FadeInDown.duration(200).delay(index * 40).easing(Easing.out(Easing.quad))
              }
            >
              <Pressable
                onPress={() => handleSelectSuggestion(item)}
                style={[styles.suggestionRow, { borderBottomColor: colors.outlineVariant }]}
              >
                <MaterialIcons name="place" size={18} color={colors.outline} />
                <Text style={[styles.suggestionText, { fontFamily: fontRegular, color: colors.onSurface }]}>
                  {item}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 8,
    left: spacing.edge,
    right: spacing.edge,
    zIndex: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 10,
    ...shadows.md,
  },
  leadingIcon: {
    marginLeft: 4,
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  placeholder: {
    position: 'absolute',
    left: 4,
    fontSize: 18,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 999,
  },
  directionsBtn: {
    padding: 10,
    borderRadius: radii.md,
    marginLeft: 4,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 16,
  },
});
