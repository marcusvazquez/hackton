import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarrierChip } from '../components/BarrierChip';
import { SubmitButton } from '../components/SubmitButton';
import { useAccessibility } from '../context/AccessibilityContext';
import { BARRIER_TYPES } from '../data/barriers';
import { colors, spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';

type Props = {
  onReportSuccess: () => void;
};

export function ReportScreen({ onReportSuccess }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.container, talkBackEnabled && styles.containerTalkBack]}
    >
      <Text style={[styles.title, talkBackEnabled && styles.textTalkBack]}>
        Reportar barrera
      </Text>
      <Text style={[styles.subtitle, talkBackEnabled && styles.subtitleTalkBack]}>
        Selecciona el tipo de obstáculo que encontraste.
      </Text>

      <View style={styles.grid}>
        {BARRIER_TYPES.map((barrier, index) => (
          <BarrierChip
            key={barrier.id}
            barrier={barrier}
            index={index}
            onSelect={setSelected}
            selected={selected === barrier.id}
          />
        ))}
      </View>

      <SubmitButton disabled={!selected} onSuccess={onReportSuccess} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  containerTalkBack: {
    backgroundColor: '#000000',
  },
  content: {
    padding: spacing.edge,
    paddingBottom: SCROLL_BOTTOM_INSET,
    paddingTop: 8,
  },
  title: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
    color: colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
