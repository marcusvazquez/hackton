import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onMenuPress: () => void;
  onSearchPress?: () => void;
  onSettingsPress?: () => void;
};

export function AppHeader({ onMenuPress, onSearchPress, onSettingsPress }: Props) {
  const insets = useSafeAreaInsets();
  const { talkBackEnabled } = useAccessibility();
  const { colors, glass, fontBold, isHackathon } = useAppTheme();

  return (
    <View style={[styles.headerWrap, { paddingTop: insets.top + 6 }]}>
      <View
        style={[
          styles.header,
          shadows.sm,
          isHackathon && styles.headerHackathon,
          {
            backgroundColor: talkBackEnabled ? '#000000' : glass.light,
            borderColor: talkBackEnabled ? '#ffffff33' : glass.border,
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
      <Text
        style={[
          styles.title,
          { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
        ]}
      >
        Ruta Libre
      </Text>
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
    </View>
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
    minHeight: spacing.touchMin,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  iconButton: {
    width: spacing.touchMin,
    height: spacing.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -8,
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
    shadowColor: '#00e5ff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
