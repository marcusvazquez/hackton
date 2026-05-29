import { speakMessage, stopGeneratedAudio } from './playGeneratedAudio';

let speaking = false;
let pendingText: string | null = null;

/** Lee texto en voz alta con TTS (expo-speech / Web Speech API). */
export async function speakTalkBack(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (speaking) {
    pendingText = trimmed;
    await stopGeneratedAudio();
    speaking = false;
    const next = pendingText;
    pendingText = null;
    if (next && next !== trimmed) {
      await speakTalkBack(next);
    }
    return;
  }

  speaking = true;
  try {
    await speakMessage(trimmed);
  } finally {
    speaking = false;
    if (pendingText) {
      const next = pendingText;
      pendingText = null;
      await speakTalkBack(next);
    }
  }
}

export async function stopTalkBackSpeech(): Promise<void> {
  pendingText = null;
  speaking = false;
  await stopGeneratedAudio();
}
