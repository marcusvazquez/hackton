import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { colors, spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

export function PlanearScreen() {
  const { talkBackEnabled } = useAccessibility();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        talkBackEnabled && styles.contentTalkBack,
      ]}
      style={[styles.container, talkBackEnabled && styles.containerTalkBack]}
    >
      <MaterialIcons
        name="directions-walk"
        size={64}
        color={talkBackEnabled ? '#ffffff' : colors.primary}
      />
      <Text style={[styles.title, talkBackEnabled && styles.textTalkBack]}>
        Planear ruta
      </Text>
      <Text style={[styles.subtitle, talkBackEnabled && styles.subtitleTalkBack]}>
        Próximamente podrás trazar rutas accesibles según tus necesidades de
        movilidad, evitando barreras reportadas por la comunidad.
      </Text>
      <View style={[styles.card, talkBackEnabled && styles.cardTalkBack]}>
        <Text style={[styles.cardTitle, talkBackEnabled && styles.textTalkBack]}>
          Sugerencia rápida
        </Text>
        <Text style={[styles.cardBody, talkBackEnabled && styles.subtitleTalkBack]}>
          Centro → Zona Río (ruta segura, 2.4 km, sin escalones)
        </Text>
      </View>
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.edge,
    paddingBottom: SCROLL_BOTTOM_INSET,
    gap: 16,
  },
  contentTalkBack: {
    borderWidth: 1,
    borderColor: '#ffffff33',
    margin: 8,
    borderRadius: 12,
  },
  title: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  card: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.gutter,
    ...shadows.md,
  },
  cardTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
  },
  cardTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
});
