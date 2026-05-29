import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { hackathonColors } from '../theme/hackathonColors';
import { hackathonNeonText, hackathonTypography } from '../theme/hackathonLayout';
import { spacing } from '../theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  const { colors, fontBold, fontRegular, isHackathon, fontNav, fontPixel } = useAppTheme();
  const titleFont = isHackathon ? fontNav : fontBold;

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        {isHackathon ? (
          <Text
            style={[
              styles.pixel,
              { fontFamily: fontPixel, ...hackathonNeonText(colors.primary) },
            ]}
          >
            //
          </Text>
        ) : null}
        <Text
          style={[
            styles.title,
            {
              fontFamily: titleFont,
              color: colors.onSurface,
              fontSize: isHackathon ? hackathonTypography.sectionTitle : undefined,
              lineHeight: isHackathon ? hackathonTypography.lineBody : undefined,
            },
            isHackathon && hackathonNeonText(hackathonColors.neonGreen),
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                fontFamily: fontRegular,
                color: colors.onSurfaceVariant,
                fontSize: isHackathon ? hackathonTypography.bodyXs : undefined,
                lineHeight: isHackathon ? hackathonTypography.lineBodySm : undefined,
              },
            ]}
          >
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
