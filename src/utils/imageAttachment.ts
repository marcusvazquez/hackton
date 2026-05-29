import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export type ImageAttachment = {
  base64: string;
  mimeType: string;
};

export async function uriToImageAttachment(uri: string): Promise<ImageAttachment> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
      reader.readAsDataURL(blob);
    });
    return { base64, mimeType };
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  const extension = uri.split('.').pop()?.toLowerCase();
  const mimeType =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

  return { base64, mimeType };
}
