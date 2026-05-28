import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { PersonTypeId } from '../data/personTypes';

const STORAGE_KEYS = {
  personType: '@ruta_libre/person_type',
  onboardingDone: '@ruta_libre/onboarding_done',
} as const;

type AccessibilityContextValue = {
  talkBackEnabled: boolean;
  setTalkBackEnabled: (value: boolean) => void;
  reduceMotion: boolean;
  toggleTalkBack: () => void;
  personType: PersonTypeId | null;
  setPersonType: (value: PersonTypeId) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isHydrated: boolean;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function getWebPrefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [talkBackEnabled, setTalkBackEnabled] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [personType, setPersonTypeState] = useState<PersonTypeId | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const [storedType, storedDone] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.personType),
          AsyncStorage.getItem(STORAGE_KEYS.onboardingDone),
        ]);
        if (!mounted) return;
        if (storedType) {
          setPersonTypeState(storedType as PersonTypeId);
        }
        setHasCompletedOnboarding(storedDone === 'true');
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      if (mounted) {
        setSystemReduceMotion(enabled || getWebPrefersReducedMotion());
      }
    };

    load();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setSystemReduceMotion(enabled || getWebPrefersReducedMotion());
      },
    );

    let mediaQuery: MediaQueryList | undefined;
    let onMediaChange: (() => void) | undefined;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      onMediaChange = () => {
        setSystemReduceMotion(mediaQuery?.matches ?? false);
      };
      mediaQuery.addEventListener('change', onMediaChange);
    }

    return () => {
      mounted = false;
      subscription.remove();
      if (mediaQuery && onMediaChange) {
        mediaQuery.removeEventListener('change', onMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.classList.toggle('reduce-motion', talkBackEnabled);
    }
  }, [talkBackEnabled]);

  const reduceMotion = systemReduceMotion || talkBackEnabled;

  const toggleTalkBack = useCallback(() => {
    setTalkBackEnabled((prev) => !prev);
  }, []);

  const setPersonType = useCallback((value: PersonTypeId) => {
    setPersonTypeState(value);
    void AsyncStorage.setItem(STORAGE_KEYS.personType, value);
    if (value === 'visual') {
      setTalkBackEnabled(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    void AsyncStorage.setItem(STORAGE_KEYS.onboardingDone, 'true');
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasCompletedOnboarding(false);
    setPersonTypeState(null);
    void AsyncStorage.multiRemove([
      STORAGE_KEYS.onboardingDone,
      STORAGE_KEYS.personType,
    ]);
  }, []);

  const value = useMemo(
    () => ({
      talkBackEnabled,
      setTalkBackEnabled,
      reduceMotion,
      toggleTalkBack,
      personType,
      setPersonType,
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding,
      isHydrated,
    }),
    [
      talkBackEnabled,
      reduceMotion,
      toggleTalkBack,
      personType,
      setPersonType,
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding,
      isHydrated,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return ctx;
}
