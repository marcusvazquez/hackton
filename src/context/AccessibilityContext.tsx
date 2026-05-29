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
import { AccessibilityInfo, Platform } from 'react-native';
import { PersonTypeId } from '../data/personTypes';
import { speakTalkBack, stopTalkBackSpeech } from '../utils/talkBackTts';

const STORAGE_KEYS = {
  personType: '@ruta_libre/person_type',
  onboardingDone: '@ruta_libre/onboarding_done',
  hackathonMode: '@ruta_libre/hackathon_mode',
  talkBack: '@ruta_libre/talkback_enabled',
} as const;

type AccessibilityContextValue = {
  talkBackEnabled: boolean;
  setTalkBackEnabled: (value: boolean) => void;
  /** Lee en voz alta si el modo lector está activo (TTS). */
  speak: (text: string) => Promise<void>;
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  systemScreenReader: boolean;
  toggleTalkBack: () => void;
  personType: PersonTypeId | null;
  setPersonType: (value: PersonTypeId) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isHydrated: boolean;
  hackathonMode: boolean;
  setHackathonMode: (value: boolean) => void;
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
  const [systemScreenReader, setSystemScreenReader] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [personType, setPersonTypeState] = useState<PersonTypeId | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hackathonMode, setHackathonModeState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const talkBackRef = useRef(talkBackEnabled);
  talkBackRef.current = talkBackEnabled;

  const speak = useCallback(async (text: string) => {
    if (!talkBackRef.current) return;
    await speakTalkBack(text);
  }, []);

  const announceTalkBackMode = useCallback((enabled: boolean) => {
    const message = enabled
      ? 'Modo lector activado. La aplicación leerá en voz alta al tocar elementos.'
      : 'Modo lector desactivado';
    if (enabled) {
      void speakTalkBack(message);
      return;
    }
    void speakTalkBack(message).finally(() => {
      void stopTalkBackSpeech();
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const [storedType, storedDone, storedHackathon, storedTalkBack] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.personType),
          AsyncStorage.getItem(STORAGE_KEYS.onboardingDone),
          AsyncStorage.getItem(STORAGE_KEYS.hackathonMode),
          AsyncStorage.getItem(STORAGE_KEYS.talkBack),
        ]);
        if (!mounted) return;
        if (storedType) {
          setPersonTypeState(storedType as PersonTypeId);
        }
        // Force onboarding to false so the user can see the disability selection screen every time
        setHasCompletedOnboarding(false);
        setHackathonModeState(storedHackathon === 'true');
        if (storedTalkBack === 'true') {
          setTalkBackEnabled(true);
        } else if (storedTalkBack !== 'false' && storedType === 'visual') {
          setTalkBackEnabled(true);
        }
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

    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      if (mounted) {
        setSystemScreenReader(enabled);
        if (enabled) {
          setTalkBackEnabled(true);
          void AsyncStorage.setItem(STORAGE_KEYS.talkBack, 'true');
        }
      }
    };

    checkScreenReader();

    const srSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (!mounted) return;
        setSystemScreenReader(enabled);
        if (enabled) {
          setTalkBackEnabled(true);
          void AsyncStorage.setItem(STORAGE_KEYS.talkBack, 'true');
        }
      },
    );

    return () => {
      mounted = false;
      srSubscription.remove();
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

  const reduceMotion = systemReduceMotion || talkBackEnabled;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.classList.toggle('reduce-motion', reduceMotion);
      document.body.classList.toggle('talkback-mode', talkBackEnabled);
      document.body.classList.toggle('hackathon-mode', hackathonMode && !talkBackEnabled);
    }
  }, [talkBackEnabled, hackathonMode, reduceMotion]);

  const applyTalkBack = useCallback(
    (value: boolean) => {
      setTalkBackEnabled(value);
      void AsyncStorage.setItem(STORAGE_KEYS.talkBack, value ? 'true' : 'false');
      announceTalkBackMode(value);
    },
    [announceTalkBackMode],
  );

  const setHackathonMode = useCallback((value: boolean) => {
    setHackathonModeState(value);
    void AsyncStorage.setItem(STORAGE_KEYS.hackathonMode, value ? 'true' : 'false');
  }, []);

  const toggleTalkBack = useCallback(() => {
    setTalkBackEnabled((prev) => {
      const next = !prev;
      void AsyncStorage.setItem(STORAGE_KEYS.talkBack, next ? 'true' : 'false');
      announceTalkBackMode(next);
      return next;
    });
  }, [announceTalkBackMode]);

  const setPersonType = useCallback(
    (value: PersonTypeId) => {
      setPersonTypeState(value);
      void AsyncStorage.setItem(STORAGE_KEYS.personType, value);
      if (value === 'visual') {
        void AsyncStorage.getItem(STORAGE_KEYS.talkBack).then((stored) => {
          if (stored !== 'false') {
            applyTalkBack(true);
          }
        });
      }
    },
    [applyTalkBack],
  );

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
      setTalkBackEnabled: applyTalkBack,
      speak,
      reduceMotion,
      systemReduceMotion,
      systemScreenReader,
      toggleTalkBack,
      personType,
      setPersonType,
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding,
      isHydrated,
      hackathonMode,
      setHackathonMode,
    }),
    [
      talkBackEnabled,
      applyTalkBack,
      speak,
      reduceMotion,
      systemReduceMotion,
      systemScreenReader,
      toggleTalkBack,
      personType,
      setPersonType,
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding,
      isHydrated,
      hackathonMode,
      setHackathonMode,
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
