import { useMemo } from 'react';
import { getMapOverlay } from '../theme/layout';
import { useAppTheme } from './useAppTheme';

export function useMapOverlayInsets() {
  const { isHackathon } = useAppTheme();
  return useMemo(() => getMapOverlay(isHackathon), [isHackathon]);
}
