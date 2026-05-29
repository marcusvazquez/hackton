export type OfflineMap = {
  id: string;
  name: string;
  sizeMb: number;
  status: 'downloaded' | 'downloading' | 'available';
  progress?: number;
};

export type SyncQueueItem = {
  id: string;
  label: string;
  status: 'pending' | 'syncing' | 'done';
};

export const OFFLINE_MAPS: OfflineMap[] = [
  { id: 'centro', name: 'Centro / Zona Río', sizeMb: 42, status: 'downloaded' },
  { id: 'playas', name: 'Playas de Tijuana', sizeMb: 38, status: 'downloading', progress: 67 },
  { id: 'otay', name: 'Otay / Industrial', sizeMb: 51, status: 'available' },
];

export const SYNC_QUEUE: SyncQueueItem[] = [
  { id: '1', label: 'Reporte acera Constitución', status: 'pending' },
  { id: '2', label: 'Confirmación rampa Macroplaza', status: 'syncing' },
  { id: '3', label: 'Foto barrera Centro', status: 'done' },
];

export const STORAGE_USED_MB = 128;
export const STORAGE_TOTAL_MB = 512;
