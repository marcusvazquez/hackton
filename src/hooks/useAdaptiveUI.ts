import { useMemo } from 'react';
import { PersonType, useAccessibility } from '../context/AccessibilityContext';

export type AdaptiveUI = {
  personType: PersonType | null;
  fontSize: number;
  minTouchTarget: number;
  itemSpacing: number;
  highContrast: boolean;
  showCaptions: boolean;
  simplifiedUI: boolean;
  useHaptics: boolean;
  largeIcons: boolean;
};

export function useAdaptiveUI(): AdaptiveUI {
  const { personType, hackathonMode } = useAccessibility();

  return useMemo(() => {
    if (hackathonMode) {
      return {
        personType,
        /** VT323 en chips y formularios — Press Start desborda en celdas estrechas. */
        fontSize: personType === 'visual' ? 15 : 14,
        minTouchTarget: personType === 'motriz' ? 64 : 48,
        itemSpacing: 12,
        highContrast: personType === 'visual',
        showCaptions: personType === 'auditiva',
        simplifiedUI: personType === 'cognitiva',
        useHaptics: personType === 'auditiva' || personType === 'visual',
        largeIcons: personType === 'visual' || personType === 'cognitiva',
      };
    }

    const fontSize =
      personType === 'visual' ? 22 : personType === 'cognitiva' ? 20 : 16;
    const minTouchTarget = personType === 'motriz' ? 72 : 48;
    const itemSpacing =
      personType === 'cognitiva' || personType === 'motriz' ? 20 : 12;

    return {
      personType,
      fontSize,
      minTouchTarget,
      itemSpacing,
      highContrast: personType === 'visual',
      showCaptions: personType === 'auditiva',
      simplifiedUI: personType === 'cognitiva',
      useHaptics: personType === 'auditiva' || personType === 'visual',
      largeIcons: personType === 'visual' || personType === 'cognitiva',
    };
  }, [personType, hackathonMode]);
}
