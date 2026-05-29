import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteOption } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii } from '../theme/shadows';

type Props = {
  route: RouteOption;
  selected: boolean;
  onSelect: () => void;
  onChoose: () => void;
};

export function RouteOptionCard({ route, selected, onSelect, onChoose }: Props) {
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const accent = route.type === 'accessible' ? colors.safeGreen : colors.primary;

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: selected ? accent : colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
        isHackathon && selected && { shadowColor: accent, shadowOpacity: 0.35, shadowRadius: 8 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {route.recommended ? (
        <View style={[styles.badge, { backgroundColor: colors.safeGreen }]}>
          <Text style={[styles.badgeText, { fontFamily: fontBold }]}>RECOMENDADA</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={[styles.label, { fontFamily: fontBold, color: colors.onSurface }]}>
          {route.label}
        </Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.meta, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
            {route.duration} · {route.distance}
          </Text>
        </View>
      </View>

      <Text style={[styles.subtitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
        {route.subtitle}
      </Text>

      <View style={styles.scoreRow}>
        <Text style={[styles.scoreLabel, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Accesibilidad
        </Text>
        <View style={[styles.scoreBar, { backgroundColor: colors.surfaceContainerHigh }]}>
          <View
            style={[
              styles.scoreFill,
              {
                width: `${route.accessibilityScore}%`,
                backgroundColor: route.accessibilityScore >= 80 ? colors.safeGreen : colors.secondary,
              },
            ]}
          />
        </View>
        <Text style={[styles.scoreValue, { fontFamily: fontBold, color: accent }]}>
          {route.accessibilityScore}%
        </Text>
      </View>

      <View style={styles.tags}>
        {route.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { borderColor: colors.outlineVariant }]}>
            <Text style={[styles.tagText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {selected ? (
        <Pressable
          onPress={onChoose}
          style={[styles.chooseBtn, { backgroundColor: accent }]}
          accessibilityRole="button"
          accessibilityLabel={`Elegir ${route.label}`}
        >
          <Text style={[styles.chooseText, { fontFamily: fontBold, color: colors.onPrimary }]}>
            Elegir esta ruta
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    color: '#12121f',
    letterSpacing: 1,
  },
  header: { gap: 4 },
  label: { fontSize: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 14 },
  subtitle: { fontSize: 14 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLabel: { fontSize: 12, width: 88 },
  scoreBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3 },
  scoreValue: { fontSize: 14, width: 40, textAlign: 'right' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12 },
  chooseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    marginTop: 4,
  },
  chooseText: { fontSize: 16 },
});
