import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        {isHackathon ? (
          <Text style={[styles.pixel, { fontFamily: fontBold, color: colors.primary }]}>//</Text>
        ) : null}
        <Text style={[styles.title, { fontFamily: fontBold, color: colors.onSurface }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.gutter,
    gap: 12,
  },
  textCol: { flex: 1, gap: 2 },
  pixel: { fontSize: 11, letterSpacing: 2, marginBottom: 2 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 14, marginTop: 2 },
});
