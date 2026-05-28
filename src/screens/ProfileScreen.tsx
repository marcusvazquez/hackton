import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { TalkBackOverlay } from '../components/TalkBackOverlay';
import { useAccessibility } from '../context/AccessibilityContext';
import { getPersonTypeLabel, PERSON_TYPES } from '../data/personTypes';
import { colors, spacing } from '../theme/colors';
import { glass, radii, shadows } from '../theme/shadows';

type Props = {
  onBack: () => void;
};

export function ProfileScreen({ onBack }: Props) {
  const {
    talkBackEnabled,
    setTalkBackEnabled,
    reduceMotion,
    personType,
    setPersonType,
    resetOnboarding,
  } = useAccessibility();
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  const handleToggle = (value: boolean) => {
    if (reduceMotion) {
      setTalkBackEnabled(value);
      return;
    }
    setPendingValue(value);
    setShowOverlay(true);
  };

  const handleOverlayDone = () => {
    if (pendingValue !== null) {
      setTalkBackEnabled(pendingValue);
      setPendingValue(null);
    }
    setShowOverlay(false);
  };

  return (
    <View style={[styles.container, talkBackEnabled && styles.containerTalkBack]}>
      <View style={[styles.header, talkBackEnabled && styles.headerTalkBack]}>
        <Pressable accessibilityLabel="Volver" onPress={onBack} style={styles.backBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={talkBackEnabled ? '#ffffff' : colors.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, talkBackEnabled && styles.textTalkBack]}>
          Perfil y accesibilidad
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.row, talkBackEnabled && styles.rowTalkBack]}>
          <View style={styles.rowText}>
            <MaterialIcons
              name="record-voice-over"
              size={28}
              color={talkBackEnabled ? '#ffffff' : colors.primary}
            />
            <View style={styles.rowLabels}>
              <Text style={[styles.rowTitle, talkBackEnabled && styles.textTalkBack]}>
                Modo lector de pantalla
              </Text>
              <Text style={[styles.rowSubtitle, talkBackEnabled && styles.subtitleTalkBack]}>
                Alto contraste, bordes visibles y sin animaciones
              </Text>
            </View>
          </View>
          <Switch
            accessibilityLabel="Activar modo lector de pantalla"
            onValueChange={handleToggle}
            thumbColor={talkBackEnabled ? colors.talkBackBlue : '#f4f3f4'}
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            value={talkBackEnabled}
          />
        </View>

        <View style={[styles.row, talkBackEnabled && styles.rowTalkBack]}>
          <View style={styles.rowText}>
            <MaterialIcons
              name="accessible"
              size={28}
              color={talkBackEnabled ? '#ffffff' : colors.primary}
            />
            <View style={styles.rowLabels}>
              <Text style={[styles.rowTitle, talkBackEnabled && styles.textTalkBack]}>
                Perfil de movilidad
              </Text>
              <Text style={[styles.rowSubtitle, talkBackEnabled && styles.subtitleTalkBack]}>
                {getPersonTypeLabel(personType)}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Cambiar perfil de movilidad"
            onPress={resetOnboarding}
            style={styles.changeBtn}
          >
            <Text style={[styles.changeBtnText, talkBackEnabled && styles.textTalkBack]}>
              Cambiar
            </Text>
          </Pressable>
        </View>

        <View style={styles.chipRow}>
          {PERSON_TYPES.slice(0, 3).map((type) => (
            <Pressable
              key={type.id}
              accessibilityRole="button"
              onPress={() => setPersonType(type.id)}
              style={[
                styles.miniChip,
                personType === type.id && styles.miniChipActive,
                talkBackEnabled && styles.miniChipTalkBack,
              ]}
            >
              <Text
                style={[
                  styles.miniChipText,
                  personType === type.id && styles.miniChipTextActive,
                  talkBackEnabled && styles.textTalkBack,
                ]}
              >
                {type.title.split(' ')[0]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoCard, talkBackEnabled && styles.rowTalkBack]}>
          <Text style={[styles.infoTitle, talkBackEnabled && styles.textTalkBack]}>
            Sobre Ruta Libre
          </Text>
          <Text style={[styles.infoBody, talkBackEnabled && styles.subtitleTalkBack]}>
            App comunitaria para rutas accesibles en Tijuana. Reporta barreras,
            confirma rutas seguras y ayuda a otros usuarios.
          </Text>
        </View>
      </ScrollView>

      {showOverlay && pendingValue !== null && (
        <TalkBackOverlay targetEnabled={pendingValue} onDone={handleOverlayDone} />
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.gutter,
    gap: 12,
    ...shadows.sm,
  },
  rowTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
  },
  rowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabels: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 16,
    color: colors.onSurface,
  },
  rowSubtitle: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  infoCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.gutter,
    ...shadows.sm,
  },
  infoTitle: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.onPrimaryContainer,
    marginBottom: 8,
  },
  infoBody: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onPrimaryContainer,
    lineHeight: 24,
  },
  changeBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBtnText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 14,
    color: colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  miniChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#e8efff',
  },
  miniChipTalkBack: {
    borderColor: '#ffffff44',
    backgroundColor: '#111111',
  },
  miniChipText: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  miniChipTextActive: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    color: colors.primary,
  },
});
