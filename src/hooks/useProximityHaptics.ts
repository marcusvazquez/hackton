import { useCallback, useEffect, useState } from 'react';
import { proximityHaptics } from '../services/proximityHaptics';

/**
 * Ciclo de vida del servicio de vibración por proximidad (escáner de cámara).
 */
export function useProximityHaptics(enabled: boolean) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      proximityHaptics.stop();
      setIsActive(false);
    }

    return () => {
      proximityHaptics.stop();
      setIsActive(false);
    };
  }, [enabled]);

  const updateDistance = useCallback(
    (meters: number) => {
      if (!enabled) return;
      proximityHaptics.update(meters);
      setIsActive(proximityHaptics.isActive());
    },
    [enabled],
  );

  return { updateDistance, isActive };
}
