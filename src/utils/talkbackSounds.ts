import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Módulo de sonidos de feedback para el modo TalkBack.
 *
 * Reproduce tonos cortos usando oscillator en web y Audio.Sound en nativo
 * para dar retroalimentación auditiva a cada acción del usuario.
 */

let _audioInitialized = false;

async function ensureAudioMode(): Promise<void> {
  if (_audioInitialized) return;
  if (Platform.OS === 'web') {
    _audioInitialized = true;
    return;
  }
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    _audioInitialized = true;
  } catch {
    // ignore
  }
}

// ---------- Web: Web Audio API oscillator tones ----------

function playWebTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
    setTimeout(() => void ctx.close(), durationMs + 200);
  } catch {
    // ignore errors
  }
}

// ---------- Native: short WAV-like tone via expo-av ----------

/** Generate a tiny WAV buffer with a sine tone (PCM 16-bit mono). */
function generateToneWav(frequency: number, durationMs: number, volume = 0.4): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const fileSize = 44 + dataSize;

  const buffer = new Uint8Array(fileSize);
  const view = new DataView(buffer.buffer);

  // RIFF header
  buffer.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  view.setUint32(4, fileSize - 8, true);
  buffer.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

  // fmt chunk
  buffer.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  buffer.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const fade = Math.min(1, (numSamples - i) / (sampleRate * 0.02)); // 20ms fade-out
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * fade;
    const int16 = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    view.setInt16(44 + i * 2, int16, true);
  }

  // Convert to base64
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

async function playNativeTone(frequency: number, durationMs: number, volume = 0.4): Promise<void> {
  await ensureAudioMode();
  try {
    const base64 = generateToneWav(frequency, durationMs, volume);
    const uri = `data:audio/wav;base64,${base64}`;
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    // Auto-unload after playback
    setTimeout(() => {
      void sound.unloadAsync();
    }, durationMs + 300);
  } catch {
    // ignore
  }
}

function playTone(frequency: number, durationMs: number, volume = 0.3): void {
  if (Platform.OS === 'web') {
    playWebTone(frequency, durationMs, 'sine', volume);
  } else {
    void playNativeTone(frequency, durationMs, volume);
  }
}

// ---------- Public sound functions ----------

/** Sonido de navegación — cambio de tab, abrir/cerrar modal */
export function playNavigationSound(): void {
  playTone(880, 80, 0.25);
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Sonido de tap — presionar un botón */
export function playTapSound(): void {
  playTone(600, 50, 0.2);
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Sonido de selección — elegir una opción */
export function playSelectSound(): void {
  playTone(1200, 60, 0.2);
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Sonido de éxito — acción completada */
export function playSuccessSound(): void {
  playTone(800, 80, 0.25);
  setTimeout(() => playTone(1200, 100, 0.25), 100);
  if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Sonido de error — algo falló */
export function playErrorSound(): void {
  playTone(300, 200, 0.3);
  if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Sonido de mensaje recibido */
export function playMessageReceivedSound(): void {
  playTone(1000, 60, 0.2);
  setTimeout(() => playTone(1400, 80, 0.2), 80);
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
