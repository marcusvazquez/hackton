import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import {
  OFFLINE_MAPS_V2,
  STORAGE_STATS,
  SYNC_QUEUE_V2,
  OfflineMapV2,
  StorageStats,
  SyncQueueItemV2,
} from '../data/offlineMaps';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const STORAGE_KEYS = {
  maps: '@ruta_libre/offline_maps',
  queue: '@ruta_libre/sync_queue',
} as const;

type StoredMap = Omit<OfflineMapV2, 'downloadedAt'> & { downloadedAt?: string };
type StoredQueueItem = Omit<SyncQueueItemV2, 'savedAt'> & { savedAt: string };
type NewQueueItem = Omit<SyncQueueItemV2, 'id' | 'status' | 'savedAt'>;

type OfflineContextValue = {
  maps: OfflineMapV2[];
  syncQueue: SyncQueueItemV2[];
  storageStats: StorageStats;
  downloadMap: (id: string) => void;
  deleteMap: (id: string) => void;
  addToQueue: (item: NewQueueItem) => void;
  clearCache: () => void;
  retrySyncItem: (id: string) => void;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

function reviveMap(map: StoredMap): OfflineMapV2 {
  return { ...map, downloadedAt: map.downloadedAt ? new Date(map.downloadedAt) : undefined };
}

function reviveQueueItem(item: StoredQueueItem): SyncQueueItemV2 {
  return { ...item, savedAt: new Date(item.savedAt) };
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useNetworkStatus();
  const [maps, setMaps] = useState<OfflineMapV2[]>(OFFLINE_MAPS_V2);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItemV2[]>(SYNC_QUEUE_V2);
  const [storageStats, setStorageStats] = useState<StorageStats>(STORAGE_STATS);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncQueueRef = useRef(syncQueue);
  const downloadIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const syncTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const wasOnlineRef = useRef(isOnline);

  useEffect(() => {
    syncQueueRef.current = syncQueue;
  }, [syncQueue]);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        const [storedMaps, storedQueue] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.maps),
          AsyncStorage.getItem(STORAGE_KEYS.queue),
        ]);
        if (!mounted) return;
        if (storedMaps) setMaps((JSON.parse(storedMaps) as StoredMap[]).map(reviveMap));
        if (storedQueue) {
          setSyncQueue((JSON.parse(storedQueue) as StoredQueueItem[]).map(reviveQueueItem));
        }
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(
      STORAGE_KEYS.maps,
      JSON.stringify(maps.map((m) => ({ ...m, downloadedAt: m.downloadedAt?.toISOString() }))),
    );
  }, [maps, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(
      STORAGE_KEYS.queue,
      JSON.stringify(syncQueue.map((i) => ({ ...i, savedAt: i.savedAt.toISOString() }))),
    );
  }, [syncQueue, isHydrated]);

  const downloadMap = useCallback((id: string) => {
    const existing = downloadIntervalsRef.current[id];
    if (existing) {
      clearInterval(existing);
      delete downloadIntervalsRef.current[id];
    }
    setMaps((prev) =>
      prev.map((map) =>
        map.id === id ? { ...map, status: 'downloading' as const, progress: 0 } : map,
      ),
    );
    let elapsed = 0;
    downloadIntervalsRef.current[id] = setInterval(() => {
      elapsed += 500;
      const progress = Math.min(100, Math.round((elapsed / 3000) * 100));
      if (elapsed >= 3000) {
        clearInterval(downloadIntervalsRef.current[id]);
        delete downloadIntervalsRef.current[id];
        setMaps((prev) =>
          prev.map((map) =>
            map.id === id
              ? { ...map, status: 'downloaded' as const, progress: undefined, downloadedAt: new Date() }
              : map,
          ),
        );
        return;
      }
      setMaps((prev) =>
        prev.map((map) => (map.id === id ? { ...map, progress } : map)),
      );
    }, 500);
  }, []);

  const deleteMap = useCallback((id: string) => {
    const target = maps.find((map) => map.id === id);
    if (!target) return;
    Alert.alert('Eliminar mapa', `¿Eliminar "${target.name}" del dispositivo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const interval = downloadIntervalsRef.current[id];
          if (interval) {
            clearInterval(interval);
            delete downloadIntervalsRef.current[id];
          }
          setMaps((prev) =>
            prev.map((map) =>
              map.id === id
                ? { ...map, status: 'available' as const, progress: undefined, downloadedAt: undefined }
                : map,
            ),
          );
        },
      },
    ]);
  }, [maps]);

  const addToQueue = useCallback((item: NewQueueItem) => {
    setSyncQueue((prev) => [
      ...prev,
      { ...item, id: String(Date.now()), status: 'pending', savedAt: new Date() },
    ]);
  }, []);

  const clearCache = useCallback(() => {
    Object.values(downloadIntervalsRef.current).forEach(clearInterval);
    downloadIntervalsRef.current = {};
    Object.values(syncTimeoutsRef.current).forEach(clearTimeout);
    syncTimeoutsRef.current = {};
    setMaps((prev) =>
      prev.map((map) => ({
        ...map,
        status: 'available' as const,
        progress: undefined,
        downloadedAt: undefined,
      })),
    );
    setSyncQueue([]);
    setStorageStats(STORAGE_STATS);
  }, []);

  const retrySyncItem = useCallback((id: string) => {
    const existing = syncTimeoutsRef.current[id];
    if (existing) {
      clearTimeout(existing);
      delete syncTimeoutsRef.current[id];
    }
    setSyncQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'syncing' as const } : item)),
    );
    syncTimeoutsRef.current[id] = setTimeout(() => {
      delete syncTimeoutsRef.current[id];
      setSyncQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'done' as const } : item)),
      );
    }, 2000);
  }, []);

  useEffect(() => {
    if (!isOnline) {
      wasOnlineRef.current = false;
      return;
    }
    const justCameOnline = !wasOnlineRef.current;
    wasOnlineRef.current = true;
    if (!justCameOnline) return;
    syncQueueRef.current
      .filter((item) => item.status === 'pending')
      .forEach((item, index) => {
        setTimeout(() => retrySyncItem(item.id), index * 500);
      });
  }, [isOnline, retrySyncItem]);

  useEffect(() => {
    return () => {
      Object.values(downloadIntervalsRef.current).forEach(clearInterval);
      Object.values(syncTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const value = useMemo(
    () => ({
      maps,
      syncQueue,
      storageStats,
      downloadMap,
      deleteMap,
      addToQueue,
      clearCache,
      retrySyncItem,
    }),
    [maps, syncQueue, storageStats, downloadMap, deleteMap, addToQueue, clearCache, retrySyncItem],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOfflineContext() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOfflineContext must be used within OfflineProvider');
  return ctx;
}
