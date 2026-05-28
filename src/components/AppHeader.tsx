import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { colors, spacing } from '../theme/colors';
import { glass, radii, shadows } from '../theme/shadows';

type Props = {
  onMenuPress: () => void;
  onSearchPress?: () => void;
};

export function AppHeader({ onMenuPress, onSearchPress }: Props) {
  const insets = useSafeAreaInsets();
  const { talkBackEnabled } = useAccessibility();

  return (
    <View style={[styles.headerWrap, { paddingTop: insets.top + 6 }]}>
      <View
        style={[
          styles.header,
          shadows.sm,
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
      <Text style={[styles.title, talkBackEnabled && styles.titleTalkBack]}>
        Ruta Libre
      </Text>
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
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 24,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  titleTalkBack: {
    color: '#ffffff',
  },
});
