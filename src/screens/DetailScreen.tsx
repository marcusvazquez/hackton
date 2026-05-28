import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { colors, spacing } from '../theme/colors';
import { glass, radii, shadows } from '../theme/shadows';

type Props = {
  onBack: () => void;
};

export function DetailScreen({ onBack }: Props) {
  const { talkBackEnabled } = useAccessibility();

  return (
    <View style={[styles.container, talkBackEnabled && styles.containerTalkBack]}>
      <View style={[styles.header, talkBackEnabled && styles.headerTalkBack]}>
        <Pressable accessibilityLabel="Volver al mapa" onPress={onBack} style={styles.backBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={talkBackEnabled ? '#ffffff' : colors.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, talkBackEnabled && styles.textTalkBack]}>
          Zona Centro
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.alertCard, talkBackEnabled && styles.cardTalkBack]}>
          <MaterialIcons name="warning" size={32} color={colors.secondaryContainer} />
          <Text style={[styles.alertTitle, talkBackEnabled && styles.textTalkBack]}>
            2 barreras activas
          </Text>
          <Text style={[styles.alertBody, talkBackEnabled && styles.subtitleTalkBack]}>
            Acera rota en Av. Constitución y rampa cerrada en Macroplaza.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, talkBackEnabled && styles.textTalkBack]}>
          Ruta segura alternativa
        </Text>
        <View style={[styles.routeCard, talkBackEnabled && styles.cardTalkBack]}>
          <MaterialIcons name="check-circle" size={24} color={colors.safeGreen} />
          <View style={styles.routeText}>
            <Text style={[styles.routeName, talkBackEnabled && styles.textTalkBack]}>
              Centro → Zona Río
            </Text>
            <Text style={[styles.routeMeta, talkBackEnabled && styles.subtitleTalkBack]}>
              2.4 km · Sin escalones · Rampas verificadas
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.actionBtn, talkBackEnabled && styles.actionBtnTalkBack]}
          onPress={onBack}
        >
          <Text style={styles.actionBtnText}>Volver al mapa</Text>
        </Pressable>
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.edge,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: glass.border,
    backgroundColor: glass.light,
    ...shadows.sm,
  },
  headerTalkBack: {
    borderBottomColor: '#ffffff33',
  },
  backBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 20,
    color: colors.onSurface,
  },
  content: {
    padding: spacing.edge,
    gap: 16,
  },
  alertCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 24,
    gap: 12,
    ...shadows.md,
  },
  cardTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
  },
  alertTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 22,
    color: colors.onSurface,
  },
  alertBody: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.onSurface,
    marginTop: 8,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.gutter,
    ...shadows.sm,
  },
  routeText: {
    flex: 1,
  },
  routeName: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.onSurface,
  },
  routeMeta: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  actionBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  actionBtnTalkBack: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  actionBtnText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.onPrimary,
  },
});
