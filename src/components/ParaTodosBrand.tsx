import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { hackathonColors } from '../theme/hackathonColors';
import { hackathonNeonText } from '../theme/hackathonLayout';

type Props = {
  compact?: boolean;
  showTagline?: boolean;
  style?: ViewStyle;
};

export function ParaTodosBrand({ compact = false, showTagline = true, style }: Props) {
  const { colors, fontBold, fontRegular, fontPixel, isHackathon } = useAppTheme();
  const logoSize = compact ? 40 : 56;

  return (
    <View style={[styles.root, compact && styles.rootCompact, style]}>
      <Image
        accessibilityLabel="Logo ParaTodos"
        source={require('../../assets/paratodos-logo.png')}
        style={{ width: logoSize, height: logoSize }}
        contentFit="contain"
      />
      <View style={styles.textCol}>
        <Text
          style={[
            compact ? styles.nameCompact : styles.name,
            {
              fontFamily: isHackathon ? fontPixel : fontBold,
              color: isHackathon ? colors.primary : colors.primaryContainer,
            },
            isHackathon && styles.nameHackathon,
            isHackathon && hackathonNeonText(hackathonColors.primary),
          ]}
        >
          ParaTodos
        </Text>
        {showTagline ? (
          <Text
            style={[
              styles.tagline,
              {
                fontFamily: isHackathon ? fontRegular : fontRegular,
                color: colors.onSurfaceVariant,
              },
              isHackathon && styles.taglineHackathon,
              isHackathon && hackathonNeonText(hackathonColors.neonGreen),
            ]}
          >
            CONECTA, MAPEA. INCLUYE.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rootCompact: {
    gap: 8,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  nameCompact: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  nameHackathon: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  taglineHackathon: {
    fontSize: 14,
    letterSpacing: 2,
    lineHeight: 18,
  },
});
