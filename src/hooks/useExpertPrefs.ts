import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXPERT_PREFS } from '../data/expertPrefs';

const STORAGE_KEY = '@ruta_libre/expert_prefs';

function buildDefaultPrefs(): Record<string, boolean> {
  return Object.fromEntries(EXPERT_PREFS.map((pref) => [pref.id, pref.defaultOn]));
}

export function useExpertPrefs() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(buildDefaultPrefs);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (raw) {
          const stored = JSON.parse(raw) as Record<string, boolean>;
          setPrefs({ ...buildDefaultPrefs(), ...stored });
        } else {
          setPrefs(buildDefaultPrefs());
        }
      } catch {
        if (mounted) {
          setPrefs(buildDefaultPrefs());
        }
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const setPref = useCallback((id: string, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [id]: value };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const activeCount = useMemo(
    () => Object.values(prefs).filter(Boolean).length,
    [prefs],
  );

  return { prefs, setPref, activeCount };
}
