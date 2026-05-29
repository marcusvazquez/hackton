import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';

export class VoiceAIService {
  private recording: Audio.Recording | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  async startRecording(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      throw new Error('Permiso de micrófono denegado');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    this.recording = recording;
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      return uri;
    } finally {
      this.recording = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    }
  }

  async transcribeAudio(uri: string): Promise<string> {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // TODO: Conectar con endpoint Whisper / Gemini Speech cuando esté disponible.
    // Por ahora devolvemos vacío si no hay backend de transcripción configurado.
    void base64;
    return '';
  }

  speakResponse(text: string, onDone?: () => void): void {
    if (!text.trim()) {
      onDone?.();
      return;
    }
    Speech.speak(text, {
      language: 'es-MX',
      rate: 0.9,
      onDone,
      onStopped: onDone,
      onError: onDone,
    });
  }

  stopSpeaking(): void {
    Speech.stop();
  }
}

export const voiceAIService = new VoiceAIService();
