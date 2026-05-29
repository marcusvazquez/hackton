import { useCallback, useRef, useState } from 'react';
import { voiceAIService } from '../services/voiceAI';

export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

type Options = {
  onTranscription?: (text: string) => Promise<string | void>;
};

export function useVoiceInput(options: Options = {}) {
  const { onTranscription } = options;
  const [state, setState] = useState<VoiceInputState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busyRef = useRef(false);

  const startListening = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setErrorMessage(null);
    try {
      await voiceAIService.startRecording();
      setState('listening');
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo iniciar la grabación');
    } finally {
      busyRef.current = false;
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setState('processing');
    try {
      const uri = await voiceAIService.stopRecording();
      if (!uri) {
        setState('idle');
        return;
      }

      let text = await voiceAIService.transcribeAudio(uri);
      if (!text.trim()) {
        // Fallback demo cuando no hay backend de transcripción
        text = 'Ayúdame con mi ruta accesible';
      }

      if (onTranscription) {
        const reply = await onTranscription(text);
        if (typeof reply === 'string' && reply.trim()) {
          setState('speaking');
          await new Promise<void>((resolve) => {
            voiceAIService.speakResponse(reply, resolve);
          });
        }
      }

      setState('idle');
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar voz');
    } finally {
      busyRef.current = false;
    }
  }, [onTranscription]);

  const toggleListening = useCallback(async () => {
    if (state === 'listening') {
      await stopListening();
      return;
    }
    if (state === 'idle' || state === 'error') {
      await startListening();
    }
  }, [startListening, state, stopListening]);

  const speakText = useCallback(async (text: string) => {
    setState('speaking');
    await new Promise<void>((resolve) => {
      voiceAIService.speakResponse(text, resolve);
    });
    setState('idle');
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceAIService.stopSpeaking();
    setState('idle');
  }, []);

  return {
    state,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
  };
}
