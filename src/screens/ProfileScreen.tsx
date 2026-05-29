import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { TalkBackOverlay } from '../components/TalkBackOverlay';
import { SectionHeader } from '../components/SectionHeader';
import { ParaTodosBrand } from '../components/ParaTodosBrand';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useExpertPrefs } from '../hooks/useExpertPrefs';
import { EXPERT_PREFS } from '../data/expertPrefs';
import { getPersonTypeDescription, getPersonTypeLabel, PERSON_TYPES } from '../data/personTypes';
import {
  OFFLINE_MAPS,
  STORAGE_TOTAL_MB,
  STORAGE_USED_MB,
  SYNC_QUEUE,
} from '../data/offline';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onBack: () => void;
};

export function ProfileScreen({ onBack }: Props) {
  const {
    talkBackEnabled,
    setTalkBackEnabled,
    reduceMotion,
    systemReduceMotion,
    personType,
    setPersonType,
    resetOnboarding,
    hackathonMode,
    setHackathonMode,
  } = useAccessibility();
  const { colors, glass, fontBold, fontRegular, isHackathon } = useAppTheme();
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const { prefs: expertPrefs, setPref } = useExpertPrefs();

  const storagePct = Math.round((STORAGE_USED_MB / STORAGE_TOTAL_MB) * 100);

  const handleToggle = (value: boolean) => {
    setTalkBackEnabled(value);
    if (systemReduceMotion) {
      return;
    }
    setPendingValue(value);
    setShowOverlay(true);
  };

  const handleOverlayDone = () => {
    setPendingValue(null);
    setShowOverlay(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: talkBackEnabled ? '#000000' : colors.surface },
      ]}
    >
      <View
        style={[
          styles.header,
          talkBackEnabled && styles.headerTalkBack,
          !talkBackEnabled && {
            backgroundColor: glass.light,
            borderBottomColor: glass.border,
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
            { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
          ]}
        >
          Perfil y accesibilidad
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ParaTodosBrand style={styles.brandBlock} />

        <Text
          style={[
            styles.sectionTitle,
            {
              fontFamily: fontBold,
              color: talkBackEnabled ? '#ffffff' : colors.onSurfaceVariant,
            },
          ]}
        >
          Accesibilidad
        </Text>

        <View
          style={[
            styles.row,
            talkBackEnabled && styles.rowTalkBack,
            !talkBackEnabled && {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.rowText}>
            <MaterialIcons
              name="record-voice-over"
              size={28}
              color={talkBackEnabled ? '#ffffff' : colors.primary}
            />
            <View style={styles.rowLabels}>
              <Text
                style={[
                  styles.rowTitle,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Modo lector de pantalla
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  {
                    fontFamily: fontRegular,
                    color: talkBackEnabled ? '#cccccc' : colors.onSurfaceVariant,
                  },
                ]}
              >
                Alto contraste, lectura en voz alta y sin animaciones
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

        <View
          style={[
            styles.row,
            talkBackEnabled && styles.rowTalkBack,
            !talkBackEnabled && {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.rowText}>
            <MaterialIcons
              name="accessible"
              size={28}
              color={talkBackEnabled ? '#ffffff' : colors.primary}
            />
            <View style={styles.rowLabels}>
              <Text
                style={[
                  styles.rowTitle,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Perfil de movilidad
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  {
                    fontFamily: fontRegular,
                    color: talkBackEnabled ? '#cccccc' : colors.onSurfaceVariant,
                  },
                ]}
              >
                {getPersonTypeLabel(personType)}
              </Text>
              <Text
                style={[
                  styles.profileHint,
                  {
                    fontFamily: fontRegular,
                    color: talkBackEnabled ? '#aaaaaa' : colors.outline,
                  },
                ]}
              >
                {getPersonTypeDescription(personType)}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Cambiar perfil de movilidad"
            onPress={resetOnboarding}
            style={styles.changeBtn}
          >
            <Text
              style={[
                styles.changeBtnText,
                {
                  fontFamily: fontBold,
                  color: talkBackEnabled ? '#ffffff' : colors.primary,
                },
              ]}
            >
              Cambiar
            </Text>
          </Pressable>
        </View>

        {!talkBackEnabled ? (
          <>
            <SectionHeader
              title="Gestión offline"
              subtitle="Mapas descargados y cola de sincronización"
            />

            <View
              style={[
                styles.storageCard,
                { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
              ]}
            >
              <View style={styles.storageHeader}>
                <MaterialIcons name="storage" size={22} color={colors.primary} />
                <Text style={[styles.storageTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
                  Almacenamiento local
                </Text>
                <Text style={[styles.storagePct, { fontFamily: fontBold, color: colors.secondary }]}>
                  {storagePct}%
                </Text>
              </View>
              <View style={[styles.storageTrack, { backgroundColor: colors.outlineVariant }]}>
                <View
                  style={[
                    styles.storageFill,
                    { width: `${storagePct}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.storageMeta, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                {STORAGE_USED_MB} MB de {STORAGE_TOTAL_MB} MB usados
              </Text>
            </View>

            {OFFLINE_MAPS.map((map) => (
              <View
                key={map.id}
                style={[
                  styles.offlineRow,
                  { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                ]}
              >
                <MaterialIcons
                  name={
                    map.status === 'downloaded'
                      ? 'cloud-done'
                      : map.status === 'downloading'
                        ? 'cloud-download'
                        : 'cloud-queue'
                  }
                  size={24}
                  color={map.status === 'downloaded' ? colors.safeGreen : colors.primary}
                />
                <View style={styles.offlineText}>
                  <Text style={[styles.rowTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
                    {map.name}
                  </Text>
                  <Text style={[styles.rowSubtitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                    {map.sizeMb} MB
                    {map.status === 'downloading' && map.progress != null
                      ? ` · Descargando ${map.progress}%`
                      : map.status === 'downloaded'
                        ? ' · Listo'
                        : ' · Disponible'}
                  </Text>
                  {map.status === 'downloading' && map.progress != null ? (
                    <View style={[styles.storageTrack, styles.mapProgress, { backgroundColor: colors.outlineVariant }]}>
                      <View
                        style={[
                          styles.storageFill,
                          { width: `${map.progress}%`, backgroundColor: colors.secondary },
                        ]}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            <Text
              style={[
                styles.sectionTitle,
                { fontFamily: fontBold, color: colors.onSurfaceVariant },
              ]}
            >
              Cola de sync
            </Text>
            {SYNC_QUEUE.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.syncRow,
                  { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                ]}
              >
                <MaterialIcons
                  name={
                    item.status === 'done'
                      ? 'check-circle'
                      : item.status === 'syncing'
                        ? 'sync'
                        : 'schedule'
                  }
                  size={20}
                  color={
                    item.status === 'done'
                      ? colors.safeGreen
                      : item.status === 'syncing'
                        ? colors.secondary
                        : colors.onSurfaceVariant
                  }
                />
                <Text style={[styles.syncLabel, { fontFamily: fontRegular, color: colors.onSurface }]}>
                  {item.label}
                </Text>
                <Text style={[styles.syncStatus, { fontFamily: fontBold, color: colors.primary }]}>
                  {item.status === 'done' ? 'OK' : item.status === 'syncing' ? 'SYNC' : 'PEND'}
                </Text>
              </View>
            ))}

            <SectionHeader
              title="Modo experto"
              subtitle="Ajustes avanzados de planificación"
            />

            {EXPERT_PREFS.map((pref) => (
              <View
                key={pref.id}
                style={[
                  styles.row,
                  { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                ]}
              >
                <View style={styles.rowLabels}>
                  <Text style={[styles.rowTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
                    {pref.label}
                  </Text>
                  <Text style={[styles.rowSubtitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                    {pref.description}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={pref.label}
                  onValueChange={(v) => setPref(pref.id, v)}
                  thumbColor={expertPrefs[pref.id] ? colors.primary : '#f4f3f4'}
                  trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                  value={expertPrefs[pref.id]}
                />
              </View>
            ))}
          </>
        ) : null}

        <Text
          style={[
            styles.sectionTitle,
            {
              fontFamily: fontBold,
              color: talkBackEnabled ? '#ffffff' : colors.onSurfaceVariant,
            },
          ]}
        >
          Configuración
        </Text>

        <View
          style={[
            styles.row,
            talkBackEnabled && styles.rowTalkBack,
            !talkBackEnabled && {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: isHackathon ? colors.primary : colors.outlineVariant,
            },
            isHackathon && styles.rowHackathon,
          ]}
        >
          <View style={styles.rowText}>
            <MaterialIcons
              name="bolt"
              size={28}
              color={talkBackEnabled ? '#ffffff' : colors.primary}
            />
            <View style={styles.rowLabels}>
              <Text
                style={[
                  styles.rowTitle,
                  { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
                ]}
              >
                Modo hackathon
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  {
                    fontFamily: fontRegular,
                    color: talkBackEnabled ? '#cccccc' : colors.onSurfaceVariant,
                  },
                ]}
              >
                {isHackathon
                  ? '▶ HACKFOX · PIXEL · NEON · INSERT COIN TO INNOVATE'
                  : 'Estilo arcade HackFox (pixel + cyber/neon) para demos'}
              </Text>
            </View>
          </View>
          <Switch
            accessibilityLabel="Activar modo hackathon"
            onValueChange={setHackathonMode}
            thumbColor={hackathonMode ? colors.primary : '#f4f3f4'}
            trackColor={{
              false: colors.outlineVariant,
              true: colors.primaryContainer,
            }}
            value={hackathonMode}
          />
        </View>

        <View style={styles.chipRow}>
          {PERSON_TYPES.map((type) => (
            <Pressable
              key={type.id}
              accessibilityRole="button"
              onPress={() => setPersonType(type.id)}
              style={[
                styles.miniChip,
                !talkBackEnabled && {
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLowest,
                },
                personType === type.id &&
                  !talkBackEnabled && {
                    borderColor: colors.primary,
                    backgroundColor: colors.selectedSurface,
                  },
                talkBackEnabled && styles.miniChipTalkBack,
              ]}
            >
              <Text
                style={[
                  styles.miniChipText,
                  { fontFamily: fontRegular, color: colors.onSurfaceVariant },
                  personType === type.id && {
                    fontFamily: fontBold,
                    color: colors.primary,
                  },
                  talkBackEnabled && { color: '#ffffff' },
                ]}
              >
                {type.title.split(' ')[0]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.infoCard,
            talkBackEnabled && styles.rowTalkBack,
            !talkBackEnabled && { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Text
            style={[
              styles.infoTitle,
              {
                fontFamily: fontBold,
                color: talkBackEnabled ? '#ffffff' : colors.onPrimaryContainer,
              },
            ]}
          >
            Sobre ParaTodos
          </Text>
          <Text
            style={[
              styles.infoBody,
              {
                fontFamily: fontRegular,
                color: talkBackEnabled ? '#cccccc' : colors.onPrimaryContainer,
              },
            ]}
          >
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
  },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: -4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    padding: 20,
    gap: 16,
  },
  brandBlock: {
    marginBottom: 4,
  },
  profileHint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    ...shadows.sm,
  },
  rowHackathon: {
    shadowColor: '#00e5ff',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
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
    fontSize: 16,
  },
  rowSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  changeBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBtnText: {
    fontSize: 14,
  },
  infoCard: {
    borderRadius: radii.xl,
    padding: 16,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  infoBody: {
    fontSize: 16,
    lineHeight: 24,
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
  },
  miniChipTalkBack: {
    borderColor: '#ffffff44',
    backgroundColor: '#111111',
  },
  miniChipText: {
    fontSize: 13,
  },
  storageCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    ...shadows.sm,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageTitle: {
    flex: 1,
    fontSize: 16,
  },
  storagePct: {
    fontSize: 14,
  },
  storageTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    borderRadius: 3,
  },
  storageMeta: {
    fontSize: 12,
  },
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 14,
    ...shadows.sm,
  },
  offlineText: {
    flex: 1,
  },
  mapProgress: {
    marginTop: 8,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  syncLabel: {
    flex: 1,
    fontSize: 14,
  },
  syncStatus: {
    fontSize: 10,
    letterSpacing: 1,
  },
});
