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
import { colors, spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onComplete: () => void;
};

export function PersonTypeScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, setPersonType } = useAccessibility();
  const { chipEnter, reduceMotion } = useAnimations();
  const [selected, setSelected] = useState<PersonTypeId | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setPersonType(selected);
    completeOnboarding();
    onComplete();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <MaterialIcons name="accessible-forward" size={40} color={colors.onPrimary} />
        </View>
        <Text style={styles.title}>Ruta Libre</Text>
        <Text style={styles.headline}>¿Cómo te movemos por Tijuana?</Text>
        <Text style={styles.subtitle}>
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
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.iconBoxSelected,
                  ]}
                >
                  <MaterialIcons
                    name={option.icon as keyof typeof MaterialIcons.glyphMap}
                    size={28}
                    color={isSelected ? colors.onPrimary : colors.primary}
                  />
                </View>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {option.title}
                </Text>
                <Text style={styles.optionDesc}>{option.description}</Text>
                {isSelected && (
                  <Animated.View
                    entering={reduceMotion ? undefined : ZoomIn.duration(200)}
                    style={styles.check}
                  >
                    <MaterialIcons name="check" size={16} color={colors.onPrimary} />
                  </Animated.View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityLabel="Continuar con el perfil seleccionado"
          accessibilityState={{ disabled: !selected }}
          disabled={!selected}
          onPress={handleContinue}
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
        >
          <Text style={styles.continueText}>Continuar</Text>
          <MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.footerHint}>Puedes cambiar esto después en Perfil.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadows.md,
  },
  title: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryContainer,
  },
  headline: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 24,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
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
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    padding: 16,
    minHeight: 152,
    position: 'relative',
    ...shadows.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedSurface,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconBoxSelected: {
    backgroundColor: colors.primary,
  },
  optionTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDesc: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.edge,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    minHeight: spacing.touchMin,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  continueBtnDisabled: {
    opacity: 0.45,
  },
  continueText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.onPrimary,
  },
  footerHint: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 13,
    color: colors.outline,
    textAlign: 'center',
    marginTop: 10,
  },
});
