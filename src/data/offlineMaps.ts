export type OfflineMapV2 = {
  id: string;
  name: string;
  zone: string;
  sizeMb: number;
  status: 'downloaded' | 'downloading' | 'available' | 'error';
  progress?: number;
  downloadedAt?: Date;
};

export type SyncQueueItemV2 = {
  id: string;
  label: string;
  location: string;
  barrierTypeId: string;
  status: 'pending' | 'syncing' | 'done' | 'failed';
  savedAt: Date;
  coords?: { lat: number; lng: number };
};

export type StorageStats = {
  usedMb: number;
  totalMb: number;
  pct: number;
};

export const OFFLINE_MAPS_V2: OfflineMapV2[] = [
  {
    id: 'zona-rio',
    name: 'Zona Río',
    zone: 'Norte',
    sizeMb: 12,
    status: 'downloaded',
    downloadedAt: new Date(),
  },
  {
    id: 'zona-centro',
    name: 'Zona Centro',
    zone: 'Centro',
    sizeMb: 8,
    status: 'downloaded',
    downloadedAt: new Date(),
  },
  {
    id: 'otay',
    name: 'Otay / Industrial',
    zone: 'Este',
    sizeMb: 45,
    status: 'available',
  },
];

export const SYNC_QUEUE_V2: SyncQueueItemV2[] = [
  {
    id: 'sq-1',
    label: 'Banqueta Obstruida',
    location: 'Av. Revolución',
    barrierTypeId: 'banqueta',
    status: 'pending',
    savedAt: new Date(),
  },
];

export const STORAGE_STATS: StorageStats = { usedMb: 20, totalMb: 500, pct: 4 };
