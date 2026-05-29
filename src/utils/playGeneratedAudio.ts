import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;

const SPEECH_TIMEOUT_MS = 60_000;

export async function stopGeneratedAudio(): Promise<void> {
  // Stop expo-speech TTS
  try {
    await Speech.stop();
  } catch {
    // ignore
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // ignore unload errors
    }
    currentSound = null;
  }
}

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return undefined;
  }
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'es-MX') ??
    voices.find((v) => v.lang.startsWith('es-MX')) ??
    voices.find((v) => v.lang.startsWith('es-')) ??
    voices.find((v) => v.lang.startsWith('es'))
  );
}

function speakOnWeb(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    const run = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = 0.92;
      utterance.pitch = 1;
      const voice = pickSpanishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      const timer = setTimeout(finish, SPEECH_TIMEOUT_MS);
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      const onVoices = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        run();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      setTimeout(run, 300);
    } else {
      run();
    }
  });
}

/** Lee el texto en voz alta (TTS). Resuelve cuando termina o tras timeout. */
export async function speakMessage(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (Platform.OS === 'web') {
    await speakOnWeb(trimmed);
    return;
  }

  // Audible TTS on native (expo-speech)
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, SPEECH_TIMEOUT_MS);
    Speech.speak(trimmed, {
      language: 'es-MX',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => {
        clearTimeout(timeout);
        resolve();
      },
      onError: () => {
        clearTimeout(timeout);
        resolve();
      },
    });
  });
}

export async function playGeneratedAudio(
  base64: string,
  mimeType: string,
): Promise<void> {
  await stopGeneratedAudio();

  if (Platform.OS === 'web') {
    const uri = `data:${mimeType};base64,${base64}`;
    await new Promise<void>((resolve, reject) => {
      const audio = new window.Audio(uri);
      const timer = setTimeout(() => {
        audio.pause();
        resolve();
      }, SPEECH_TIMEOUT_MS);
      audio.onended = () => {
        clearTimeout(timer);
        resolve();
      };
      audio.onerror = () => {
        clearTimeout(timer);
        reject(new Error('No se pudo reproducir el audio'));
      };
      void audio.play().catch(reject);
    });
    return;
  }

  const uri = `data:${mimeType};base64,${base64}`;
  const { sound } = await Audio.Sound.createAsync({ uri });
  currentSound = sound;
  await sound.playAsync();
}
