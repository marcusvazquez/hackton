import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = '@ruta_libre/network_status';

type StoredNetworkStatus = {
  isOnline: boolean;
  isWifi: boolean;
  isCellular: boolean;
  lastOnlineAt: string | null;
};

function parseState(state: NetInfoState) {
  const isOnline = state.isConnected === true;
  const isWifi = state.type === 'wifi';
  const isCellular = state.type === 'cellular';
  return { isOnline, isWifi, isCellular };
}

async function persistStatus(status: StoredNetworkStatus): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isWifi, setIsWifi] = useState(false);
  const [isCellular, setIsCellular] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const lastOnlineRef = useRef<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    const applyState = (state: NetInfoState) => {
      const { isOnline: online, isWifi: wifi, isCellular: cellular } = parseState(state);
      setIsOnline(online);
      setIsWifi(wifi);
      setIsCellular(cellular);

      if (online) {
        const now = new Date();
        lastOnlineRef.current = now;
        setLastOnlineAt(now);
      }

      void persistStatus({
        isOnline: online,
        isWifi: wifi,
        isCellular: cellular,
        lastOnlineAt: online
          ? new Date().toISOString()
          : lastOnlineRef.current?.toISOString() ?? null,
      });
    };

    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted || !raw) return;
      try {
        const stored = JSON.parse(raw) as StoredNetworkStatus;
        if (stored.lastOnlineAt) {
          const parsed = new Date(stored.lastOnlineAt);
          lastOnlineRef.current = parsed;
          setLastOnlineAt(parsed);
        }
      } catch {
        // ignore corrupt storage
      }
    });

    const unsubscribe = NetInfo.addEventListener(applyState);
    void NetInfo.fetch().then((state) => {
      if (mounted) applyState(state);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isOnline, isWifi, isCellular, lastOnlineAt };
}
