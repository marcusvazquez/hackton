import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { ParaTodosBrand } from './ParaTodosBrand';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onMenuPress: () => void;
  onSearchPress?: () => void;
  onSettingsPress?: () => void;
};

export function AppHeader({ onMenuPress, onSearchPress, onSettingsPress }: Props) {
  const insets = useSafeAreaInsets();
  const { talkBackEnabled, reduceMotion } = useAccessibility();
  const { colors, glass, fontBold, isHackathon } = useAppTheme();

  return (
    <Animated.View 
      entering={reduceMotion ? undefined : FadeInDown.duration(400).springify()}
      style={[styles.headerWrap, { paddingTop: insets.top + 8 }]}
    >
      <View
        style={[
          styles.header,
          shadows.sm,
          isHackathon && styles.headerHackathon,
          {
            backgroundColor: talkBackEnabled && !isHackathon ? '#000000' : glass.light,
            borderColor: talkBackEnabled && !isHackathon ? '#ffffff33' : glass.border,
          },
        ]}
      >
      <Pressable
        accessibilityLabel="Abrir menú"
        onPress={onMenuPress}
        style={styles.iconButton}
      >
        <MaterialIcons
          name="menu"
          size={24}
          color={talkBackEnabled ? '#ffffff' : colors.primary}
        />
      </Pressable>
      <ParaTodosBrand compact showTagline={false} style={styles.brandCenter} />
      <View style={styles.trailingActions}>
        {onSettingsPress ? (
          <Pressable
            accessibilityLabel="Configuración offline"
            onPress={onSettingsPress}
            style={styles.iconButton}
          >
            <MaterialIcons
              name="settings"
              size={24}
              color={talkBackEnabled ? '#ffffff' : colors.primary}
            />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Buscar"
          onPress={onSearchPress}
          style={styles.iconButton}
        >
          <MaterialIcons
            name="search"
            size={24}
            color={talkBackEnabled ? '#ffffff' : colors.primary}
          />
        </Pressable>
      </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 12,
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.edge - 4,
    minHeight: spacing.touchMin + 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  iconButton: {
    width: spacing.touchMin,
    height: spacing.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -8,
  },
  brandCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  trailingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerHackathon: {
    shadowColor: '#00fbfb',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    borderColor: '#00fbfb',
  },
});
