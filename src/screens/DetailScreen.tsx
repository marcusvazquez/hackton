import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../components/SectionHeader';
import { useAccessibility } from '../context/AccessibilityContext';
import { ROUTE_OPTIONS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onBack: () => void;
};

const SELECTED_ROUTE = ROUTE_OPTIONS.find((r) => r.recommended) ?? ROUTE_OPTIONS[1];

export function DetailScreen({ onBack }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const { colors, glass, fontBold, fontRegular, isHackathon } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        talkBackEnabled ? styles.containerTalkBack : { backgroundColor: colors.surface },
      ]}
    >
      <View
        style={[
          styles.header,
          talkBackEnabled
            ? styles.headerTalkBack
            : {
                borderBottomColor: glass.border,
                backgroundColor: glass.light,
              },
        ]}
      >
        <Pressable accessibilityLabel="Volver" onPress={onBack} style={styles.backBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={talkBackEnabled ? '#ffffff' : colors.primary}
          />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { fontFamily: fontBold },
            talkBackEnabled ? styles.textTalkBack : { color: colors.onSurface },
          ]}
        >
          Ruta seleccionada
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          title={SELECTED_ROUTE.label}
          subtitle={SELECTED_ROUTE.subtitle}
        />

        <View
          style={[
            styles.scoreCard,
            talkBackEnabled
              ? styles.cardTalkBack
              : {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: isHackathon ? colors.primary : colors.outlineVariant,
                },
            isHackathon && !talkBackEnabled && styles.scoreCardHackathon,
          ]}
        >
          <View style={styles.scoreRing}>
            <Text style={[styles.scoreValue, { fontFamily: fontBold, color: colors.primary }]}>
              {SELECTED_ROUTE.accessibilityScore}
            </Text>
            <Text style={[styles.scoreLabel, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
              accesibilidad
            </Text>
          </View>
          <View style={styles.scoreMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={20} color={colors.secondary} />
              <Text style={[styles.metaText, { fontFamily: fontBold, color: colors.onSurface }]}>
                {SELECTED_ROUTE.duration}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="straighten" size={20} color={colors.secondary} />
              <Text style={[styles.metaText, { fontFamily: fontBold, color: colors.onSurface }]}>
                {SELECTED_ROUTE.distance}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {SELECTED_ROUTE.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                talkBackEnabled
                  ? styles.tagTalkBack
                  : { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest },
              ]}
            >
              <MaterialIcons
                name={tag.toLowerCase().includes('barrera') ? 'warning' : 'check-circle'}
                size={14}
                color={tag.toLowerCase().includes('barrera') ? colors.secondaryContainer : colors.safeGreen}
              />
              <Text
                style={[
                  styles.tagText,
                  { fontFamily: fontRegular },
                  talkBackEnabled ? styles.subtitleTalkBack : { color: colors.onSurfaceVariant },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { fontFamily: fontBold },
            talkBackEnabled ? styles.textTalkBack : { color: colors.onSurface },
          ]}
        >
          Alertas en la ruta
        </Text>
        <View
          style={[
            styles.alertCard,
            talkBackEnabled
              ? styles.cardTalkBack
              : {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
          ]}
        >
          <MaterialIcons name="warning" size={28} color={colors.secondaryContainer} />
          <Text
            style={[
              styles.alertTitle,
              { fontFamily: fontBold },
              talkBackEnabled ? styles.textTalkBack : { color: colors.onSurface },
            ]}
          >
            2 barreras activas
          </Text>
          <Text
            style={[
              styles.alertBody,
              { fontFamily: fontRegular },
              talkBackEnabled ? styles.subtitleTalkBack : { color: colors.onSurfaceVariant },
            ]}
          >
            Acera rota en Av. Constitución y rampa cerrada en Macroplaza. La ruta alternativa las evita.
          </Text>
        </View>

        <Pressable
          style={[
            styles.actionBtn,
            talkBackEnabled
              ? styles.actionBtnTalkBack
              : { backgroundColor: colors.primary },
          ]}
          onPress={onBack}
        >
          <MaterialIcons name="navigation" size={22} color={colors.onPrimary} />
          <Text style={[styles.actionBtnText, { fontFamily: fontBold, color: colors.onPrimary }]}>
            Iniciar navegación
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={onBack}>
          <Text style={[styles.secondaryBtnText, { fontFamily: fontRegular, color: colors.primary }]}>
            Volver al mapa
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 20,
  },
  content: {
    padding: spacing.edge,
    gap: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.gutter,
    gap: 20,
    ...shadows.md,
  },
  scoreCardHackathon: {
    shadowColor: '#00fbfb',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
  },
  scoreRing: {
    alignItems: 'center',
    minWidth: 72,
  },
  scoreValue: {
    fontSize: 36,
  },
  scoreLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreMeta: {
    flex: 1,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagTalkBack: {
    borderColor: '#ffffff44',
  },
  tagText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 4,
  },
  alertCard: {
    alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    ...shadows.sm,
  },
  alertTitle: {
    fontSize: 20,
  },
  alertBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  actionBtn: {
    marginTop: 8,
    borderRadius: radii.lg,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.md,
  },
  actionBtnTalkBack: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  actionBtnText: {
    fontSize: 18,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 16,
  },
});
