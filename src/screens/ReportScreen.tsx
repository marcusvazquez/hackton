import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarrierChip } from '../components/BarrierChip';
import { SectionHeader } from '../components/SectionHeader';
import { SubmitButton } from '../components/SubmitButton';
import { useAccessibility } from '../context/AccessibilityContext';
import { BARRIER_TYPES } from '../data/barriers';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii } from '../theme/shadows';

type Props = {
  onReportSuccess: () => void;
};

export function ReportScreen({ onReportSuccess }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[
        styles.container,
        talkBackEnabled ? styles.containerTalkBack : { backgroundColor: colors.surface },
      ]}
    >
      <SectionHeader
        title="Reportar barrera"
        subtitle="Selecciona el tipo de obstáculo que encontraste"
      />

      {isHackathon && !talkBackEnabled ? (
        <View style={[styles.hintBox, { borderColor: colors.primary, backgroundColor: colors.surfaceContainerLowest }]}>
          <Text style={[styles.hintText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
            Los reportes se sincronizan con la comunidad. En modo offline quedan en cola hasta tener conexión.
          </Text>
        </View>
      ) : (
        <Text
          style={[
            styles.subtitle,
            { fontFamily: fontRegular },
            talkBackEnabled ? styles.subtitleTalkBack : { color: colors.onSurfaceVariant },
          ]}
        >
          Selecciona el tipo de obstáculo que encontraste.
        </Text>
      )}

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
  },
  containerTalkBack: {
    backgroundColor: '#000000',
  },
  content: {
    padding: spacing.edge,
    paddingBottom: SCROLL_BOTTOM_INSET,
    paddingTop: 8,
  },
  hintBox: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 16,
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
