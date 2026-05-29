import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { NetStatusBanner } from '../components/NetStatusBanner';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOfflineContext } from '../context/OfflineContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onBack: () => void;
};

const AMBER = '#f97316';
const CACHE_RED = '#dc2626';
const LIGHT_BLUE_SQUARE = '#e8efff';

export function SettingsScreen({ onBack }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const {
    maps,
    syncQueue,
    storageStats,
    downloadMap,
    deleteMap,
    clearCache,
  } = useOfflineContext();
  const [autoDownloadRoutes, setAutoDownloadRoutes] = useState(true);

  const pendingItems = syncQueue.filter((item) => item.status === 'pending');
  const gray = colors.onSurfaceVariant;

  const handleDownloadAvailable = () => {
    const target = maps.find((map) => map.status === 'available');
    if (target) {
      downloadMap(target.id);
      return;
    }
    Alert.alert('Sin zonas disponibles', 'Todas las zonas ya están descargadas o en progreso.');
  };

  const handleClearCache = () => {
    clearCache();
    Alert.alert('Caché eliminado', 'Los datos se han limpiado.');
  };

  const mapStatusLabel = (status: (typeof maps)[0]['status']) => {
    switch (status) {
      case 'downloading':
        return 'Descargando…';
      case 'available':
        return 'Disponible';
      case 'error':
        return 'Error';
      default:
        return 'Descargado';
    }
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
            borderBottomColor: colors.outlineVariant,
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
            {
              fontFamily: fontBold,
              color: talkBackEnabled ? '#ffffff' : colors.onSurface,
            },
          ]}
        >
          Configuración Offline
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <NetStatusBanner />

        <View style={styles.sectionRow}>
          <Text
            style={[
              styles.sectionTitle,
              { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
            ]}
          >
            Mapas Descargados
          </Text>
          <View style={[styles.pill, { backgroundColor: colors.primary }]}>
            <Text style={[styles.pillText, { fontFamily: fontBold }]}>
              Caché Inteligente
            </Text>
          </View>
        </View>

        {!isOnline && (
          <View style={[styles.cityCard, { backgroundColor: colors.primary }]}>
            <MaterialIcons
              name="location-city"
              size={40}
              color="#ffffff"
              style={styles.cityIcon}
            />
            <Text style={[styles.cityTitle, { fontFamily: fontBold }]}>
              Descargar Mapa de la Ciudad
            </Text>
            <Text style={[styles.citySubtitle, { fontFamily: fontRegular }]}>
              Tijuana, B.C. • 245MB sugerido
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleDownloadAvailable}
              style={styles.cityDownloadBtn}
            >
              <MaterialIcons name="file-download" size={20} color="#ffffff" />
              <Text style={[styles.cityDownloadText, { fontFamily: fontBold }]}>
                Descargar
              </Text>
            </Pressable>
          </View>
        )}

        {maps.map((map) => (
          <View
            key={map.id}
            style={[
              styles.mapCard,
              talkBackEnabled && styles.mapCardTalkBack,
              !talkBackEnabled && {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.mapCardTop}>
              <View style={[styles.mapIconSquare, { backgroundColor: LIGHT_BLUE_SQUARE }]}>
                <MaterialIcons name="map" size={24} color={colors.primary} />
              </View>
              <Pressable
                accessibilityLabel={`Eliminar ${map.name}`}
                hitSlop={8}
                onPress={() => deleteMap(map.id)}
                style={styles.deleteBtn}
              >
                <MaterialIcons name="delete" size={22} color={colors.error} />
              </Pressable>
            </View>
            <Text
              style={[
                styles.mapName,
                {
                  fontFamily: fontBold,
                  color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                },
              ]}
            >
              {map.name}
            </Text>
            <Text style={[styles.mapMeta, { fontFamily: fontRegular, color: gray }]}>
              {map.sizeMb}MB • {mapStatusLabel(map.status)}
            </Text>
            {map.status === 'downloaded' && (
              <View style={[styles.downloadedLine, { backgroundColor: colors.primary }]} />
            )}
            {map.status === 'downloading' && (
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainer }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.secondary,
                      width: `${map.progress ?? 0}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={handleDownloadAvailable}
          style={[
            styles.dashedBtn,
            { borderColor: colors.outlineVariant },
          ]}
        >
          <MaterialIcons name="add-circle-outline" size={22} color={colors.primary} />
          <Text
            style={[
              styles.dashedBtnText,
              { fontFamily: fontRegular, color: colors.primary },
            ]}
          >
            + Descargar nueva zona
          </Text>
        </Pressable>

        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleSpaced,
            { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
          ]}
        >
          Cola de Sincronización
        </Text>

        <View
          style={[
            styles.syncContainer,
            talkBackEnabled && styles.mapCardTalkBack,
            !talkBackEnabled && {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.syncHeader}>
            <Text style={[styles.syncHeaderLabel, { fontFamily: fontBold, color: gray }]}>
              PENDIENTES ({pendingItems.length})
            </Text>
            <MaterialIcons name="sync" size={22} color={colors.primary} />
          </View>

          {pendingItems.map((item) => (
            <View key={item.id} style={styles.syncItem}>
              <MaterialIcons name="schedule" size={22} color={colors.secondary} />
              <View style={styles.syncItemText}>
                <Text
                  style={[
                    styles.syncItemLabel,
                    {
                      fontFamily: fontBold,
                      color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={[styles.syncItemLocation, { fontFamily: fontRegular, color: gray }]}>
                  {item.location}
                </Text>
              </View>
              <View style={[styles.pendingBadge, { backgroundColor: AMBER }]}>
                <Text style={[styles.pendingBadgeText, { fontFamily: fontBold }]}>
                  PENDING
                </Text>
              </View>
            </View>
          ))}

          <Text style={[styles.syncFootnote, { fontFamily: fontRegular, color: gray }]}>
            Se enviará automáticamente al recuperar conexión estable.
          </Text>
        </View>

        <View style={[styles.storageCard, { backgroundColor: colors.primary }]}>
          <View style={styles.storageHeader}>
            <Text style={[styles.storageTitle, { fontFamily: fontBold }]}>
              Almacenamiento
            </Text>
            <MaterialIcons name="storage" size={24} color="#ffffff" />
          </View>
          <View style={styles.storageRow}>
            <Text style={[styles.storageLabel, { fontFamily: fontRegular }]}>
              Uso actual
            </Text>
            <Text style={[styles.storageLabel, { fontFamily: fontRegular }]}>
              {storageStats.usedMb}MB / {storageStats.totalMb}MB
            </Text>
          </View>
          <View style={styles.storageTrack}>
            <View
              style={[
                styles.storageFill,
                { width: `${storageStats.pct}%`, backgroundColor: AMBER },
              ]}
            />
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleSpaced,
            { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
          ]}
        >
          Ajustes de Almacenamiento
        </Text>

        <View
          style={[
            styles.settingRow,
            talkBackEnabled && styles.mapCardTalkBack,
            !talkBackEnabled && {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <MaterialIcons name="autorenew" size={24} color={colors.primary} />
          <View style={styles.settingRowText}>
            <Text
              style={[
                styles.settingTitle,
                {
                  fontFamily: fontBold,
                  color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                },
              ]}
            >
              Auto-descargar rutas frecuentes
            </Text>
            <Text style={[styles.settingSubtitle, { fontFamily: fontRegular, color: gray }]}>
              Descarga automática de zonas que visitas con frecuencia
            </Text>
          </View>
          <Switch
            accessibilityLabel="Auto-descargar rutas frecuentes"
            onValueChange={setAutoDownloadRoutes}
            thumbColor={autoDownloadRoutes ? colors.primary : '#f4f3f4'}
            trackColor={{
              false: colors.outlineVariant,
              true: colors.primaryContainer,
            }}
            value={autoDownloadRoutes}
          />
        </View>

        <View
          style={[
            styles.settingRow,
            talkBackEnabled && styles.mapCardTalkBack,
            !talkBackEnabled && {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <MaterialIcons name="cleaning-services" size={24} color={colors.error} />
          <View style={styles.settingRowText}>
            <Text
              style={[
                styles.settingTitle,
                {
                  fontFamily: fontBold,
                  color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                },
              ]}
            >
              Limpieza de datos
            </Text>
            <Text style={[styles.settingSubtitle, { fontFamily: fontRegular, color: gray }]}>
              Libera espacio eliminando mapas y reportes en cola
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleClearCache}
          style={[styles.clearCacheBtn, { backgroundColor: CACHE_RED }]}
        >
          <MaterialIcons name="delete-sweep" size={22} color="#ffffff" />
          <Text style={[styles.clearCacheText, { fontFamily: fontBold }]}>
            Borrar Caché
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
    width: spacing.touchMin,
    height: spacing.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.edge,
    paddingTop: spacing.gutter,
    paddingBottom: SCROLL_BOTTOM_INSET,
    gap: spacing.gutter,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
  },
  sectionTitleSpaced: {
    marginTop: 4,
  },
  pill: {
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 11,
    color: '#ffffff',
  },
  cityCard: {
    borderRadius: radii.lg,
    padding: spacing.edge,
    alignItems: 'center',
    gap: 8,
    ...shadows.md,
  },
  cityIcon: {
    marginBottom: 4,
  },
  cityTitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  citySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  cityDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'stretch',
  },
  cityDownloadText: {
    fontSize: 15,
    color: '#ffffff',
  },
  mapCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.gutter,
    marginBottom: 12,
    gap: 8,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mapCardTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
  },
  mapCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  mapIconSquare: {
    width: spacing.touchMin,
    height: spacing.touchMin,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 4,
  },
  mapName: {
    fontSize: 16,
  },
  mapMeta: {
    fontSize: 14,
  },
  downloadedLine: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  dashedBtnText: {
    fontSize: 15,
  },
  syncContainer: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.gutter,
    gap: 12,
    ...shadows.sm,
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncHeaderLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncItemText: {
    flex: 1,
    gap: 2,
  },
  syncItemLabel: {
    fontSize: 15,
  },
  syncItemLocation: {
    fontSize: 13,
  },
  pendingBadge: {
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  pendingBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  syncFootnote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  storageCard: {
    borderRadius: radii.md,
    padding: spacing.edge,
    gap: 12,
    ...shadows.md,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storageTitle: {
    fontSize: 18,
    color: '#ffffff',
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storageLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  storageTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    borderRadius: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: spacing.gutter,
    ...shadows.sm,
  },
  settingRowText: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.sm,
    ...shadows.sm,
  },
  clearCacheText: {
    fontSize: 16,
    color: '#ffffff',
  },
});
