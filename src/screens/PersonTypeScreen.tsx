import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { PERSON_TYPES, PersonTypeId } from '../data/personTypes';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onComplete: () => void;
};

export function PersonTypeScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, setPersonType } = useAccessibility();
  const { chipEnter, reduceMotion } = useAnimations();
  const { colors, fontBold, fontRegular } = useAppTheme();
  const [selected, setSelected] = useState<PersonTypeId | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setPersonType(selected);
    completeOnboarding();
    onComplete();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.surface }]}>
      <View style={styles.hero}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="accessible-forward" size={40} color={colors.onPrimary} />
        </View>
        <Text style={[styles.title, { fontFamily: fontBold, color: colors.primaryContainer }]}>
          Ruta Libre
        </Text>
        <Text style={[styles.headline, { fontFamily: fontBold, color: colors.primary }]}>
          ¿Cómo te movemos por Tijuana?
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Elige tu perfil de movilidad para personalizar rutas, alertas y reportes
          comunitarios.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {PERSON_TYPES.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <Animated.View
              key={option.id}
              entering={chipEnter(index)}
              style={styles.gridItem}
            >
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(option.id)}
                style={[
                  styles.option,
                  {
                    backgroundColor: colors.surfaceContainerLowest,
                    borderColor: colors.outlineVariant,
                  },
                  isSelected && {
                    borderColor: colors.primary,
                    backgroundColor: colors.selectedSurface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: colors.surfaceContainer },
                    isSelected && { backgroundColor: colors.primary },
                  ]}
                >
                  <MaterialIcons
                    name={option.icon as keyof typeof MaterialIcons.glyphMap}
                    size={28}
                    color={isSelected ? colors.onPrimary : colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.optionTitle,
                    { fontFamily: fontBold, color: colors.onSurface },
                    isSelected && { color: colors.primary },
                  ]}
                >
                  {option.title}
                </Text>
                <Text style={[styles.optionDesc, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                  {option.description}
                </Text>
                {isSelected && (
                  <Animated.View
                    entering={reduceMotion ? undefined : ZoomIn.duration(200)}
                    style={[styles.check, { backgroundColor: colors.primary }]}
                  >
                    <MaterialIcons name="check" size={16} color={colors.onPrimary} />
                  </Animated.View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            borderTopColor: colors.outlineVariant,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Continuar con el perfil seleccionado"
          accessibilityState={{ disabled: !selected }}
          disabled={!selected}
          onPress={handleContinue}
          style={[
            styles.continueBtn,
            { backgroundColor: colors.primary },
            !selected && styles.continueBtnDisabled,
          ]}
        >
          <Text style={[styles.continueText, { fontFamily: fontBold, color: colors.onPrimary }]}>
            Continuar
          </Text>
          <MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />
        </Pressable>
        <Text style={[styles.footerHint, { fontFamily: fontRegular, color: colors.outline }]}>
          Puedes cambiar esto después en Perfil.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.edge,
    alignItems: 'center',
    paddingBottom: 12,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadows.md,
  },
  title: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.edge - 6,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  gridItem: {
    width: '47%',
  },
  option: {
    borderWidth: 2,
    borderRadius: radii.lg,
    padding: 16,
    minHeight: 152,
    position: 'relative',
    ...shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.edge,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: spacing.touchMin,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  continueBtnDisabled: {
    opacity: 0.45,
  },
  continueText: {
    fontSize: 18,
  },
  footerHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});
