import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedCard } from '../components/FeedCard';
import { useAccessibility } from '../context/AccessibilityContext';
import { FEED_ITEMS } from '../data/community';
import { colors, spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii } from '../theme/shadows';

export function CommunityScreen() {
  const { talkBackEnabled } = useAccessibility();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.container, talkBackEnabled && styles.containerTalkBack]}
    >
      <Text style={[styles.title, talkBackEnabled && styles.textTalkBack]}>
        Comunidad
      </Text>
      <Text style={[styles.subtitle, talkBackEnabled && styles.subtitleTalkBack]}>
        Reportes y confirmaciones de la comunidad en Tijuana.
      </Text>

      {FEED_ITEMS.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}

      {Platform.OS === 'web' && <View style={{ height: 80 }} />}
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
    marginBottom: 16,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
});
