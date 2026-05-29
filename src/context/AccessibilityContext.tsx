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
import { speakTalkBack, stopTalkBackSpeech } from '../utils/talkBackTts';

export type PersonType = 'visual' | 'motriz' | 'auditiva' | 'cognitiva' | null;

const STORAGE_KEYS = {
  personType: '@ruta_libre/person_type',
  onboardingDone: '@ruta_libre/onboarding_done',
  welcomeDone: '@ruta_libre/welcome_done',
  hackathonMode: '@ruta_libre/hackathon_mode',
  talkBack: '@ruta_libre/talkback_enabled',
} as const;

function normalizeStoredPersonType(raw: string | null): PersonType | null {
  if (!raw) return null;
  const map: Record<string, PersonType> = {
    visual: 'visual',
    motriz: 'motriz',
    auditiva: 'auditiva',
    cognitiva: 'cognitiva',
    wheelchair: 'motriz',
    'reduced-mobility': 'motriz',
    hearing: 'auditiva',
    cognitive: 'cognitiva',
    unspecified: null,
  };
  return map[raw] ?? null;
}

type AccessibilityContextValue = {
  talkBackEnabled: boolean;
  setTalkBackEnabled: (value: boolean) => void;
  /** Lee en voz alta si el modo lector está activo (TTS). */
  speak: (text: string) => Promise<void>;
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  systemScreenReader: boolean;
  toggleTalkBack: () => void;
  personType: PersonType;
  setPersonType: (value: Exclude<PersonType, null>) => void;
  hasSeenWelcome: boolean;
  completeWelcome: () => void;
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
  const [talkBackPreference, setTalkBackPreference] = useState(false);
  const [personType, setPersonTypeState] = useState<PersonType>(null);
  const [systemScreenReader, setSystemScreenReader] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hackathonMode, setHackathonModeState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const talkBackEnabled = personType === 'visual' && talkBackPreference;
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
        const [storedType, storedDone, storedWelcome, storedHackathon, storedTalkBack] =
          await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.personType),
          AsyncStorage.getItem(STORAGE_KEYS.onboardingDone),
          AsyncStorage.getItem(STORAGE_KEYS.welcomeDone),
          AsyncStorage.getItem(STORAGE_KEYS.hackathonMode),
          AsyncStorage.getItem(STORAGE_KEYS.talkBack),
        ]);
        if (!mounted) return;

        const normalizedType = normalizeStoredPersonType(storedType);
        if (normalizedType) {
          setPersonTypeState(normalizedType);
        }

        setHasSeenWelcome(storedWelcome === 'true');
        setHasCompletedOnboarding(storedDone === 'true');
        setHackathonModeState(storedHackathon === 'true');

        if (normalizedType === 'visual') {
          if (storedTalkBack === 'true') {
            setTalkBackPreference(true);
          } else if (storedTalkBack !== 'false') {
            setTalkBackPreference(true);
          } else {
            setTalkBackPreference(false);
          }
        } else {
          setTalkBackPreference(false);
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
      }
    };

    checkScreenReader();

    const srSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (!mounted) return;
        setSystemScreenReader(enabled);
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
      document.body.classList.toggle('hackathon-mode', hackathonMode);
    }
  }, [talkBackEnabled, hackathonMode, reduceMotion]);

  const applyTalkBack = useCallback(
    (value: boolean) => {
      if (personType !== 'visual') return;
      setTalkBackPreference(value);
      void AsyncStorage.setItem(STORAGE_KEYS.talkBack, value ? 'true' : 'false');
      announceTalkBackMode(value);
    },
    [announceTalkBackMode, personType],
  );

  const setHackathonMode = useCallback((value: boolean) => {
    setHackathonModeState(value);
    void AsyncStorage.setItem(STORAGE_KEYS.hackathonMode, value ? 'true' : 'false');
  }, []);

  const toggleTalkBack = useCallback(() => {
    if (personType !== 'visual') return;
    setTalkBackPreference((prev) => {
      const next = !prev;
      void AsyncStorage.setItem(STORAGE_KEYS.talkBack, next ? 'true' : 'false');
      announceTalkBackMode(next);
      return next;
    });
  }, [announceTalkBackMode, personType]);

  const setPersonType = useCallback((value: Exclude<PersonType, null>) => {
    setPersonTypeState(value);
    void AsyncStorage.setItem(STORAGE_KEYS.personType, value);

    if (value === 'visual') {
      void AsyncStorage.getItem(STORAGE_KEYS.talkBack).then((stored) => {
        if (stored !== 'false') {
          setTalkBackPreference(true);
          void AsyncStorage.setItem(STORAGE_KEYS.talkBack, 'true');
        }
      });
    } else {
      setTalkBackPreference(false);
      void AsyncStorage.setItem(STORAGE_KEYS.talkBack, 'false');
    }
  }, []);

  const completeWelcome = useCallback(() => {
    setHasSeenWelcome(true);
    void AsyncStorage.setItem(STORAGE_KEYS.welcomeDone, 'true');
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    void AsyncStorage.setItem(STORAGE_KEYS.onboardingDone, 'true');
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasSeenWelcome(false);
    setHasCompletedOnboarding(false);
    setPersonTypeState(null);
    void AsyncStorage.multiRemove([
      STORAGE_KEYS.welcomeDone,
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
      hasSeenWelcome,
      completeWelcome,
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
      hasSeenWelcome,
      completeWelcome,
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
