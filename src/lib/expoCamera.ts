/**
 * Imports directos de expo-camera (evita el barrel build/index.js → ./PictureRef
 * que a veces falla en Metro/Android con UnableToResolveError).
 *
 * En web hay que usar ExpoCameraManager.web: el import explícito a
 * build/ExpoCameraManager carga requireNativeModule y PermissionStatus queda
 * undefined → "Cannot read properties of undefined (reading 'GRANTED')".
 */
import {
  createPermissionHook,
  type PermissionResponse,
} from 'expo-modules-core';
import { Platform } from 'react-native';
import CameraView from 'expo-camera/build/CameraView';

type CameraManagerModule = {
  getCameraPermissionsAsync: () => Promise<PermissionResponse>;
  requestCameraPermissionsAsync: () => Promise<PermissionResponse>;
};

const CameraManager: CameraManagerModule =
  Platform.OS === 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('expo-camera/build/ExpoCameraManager.web').default
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('expo-camera/build/ExpoCameraManager').default;

export { CameraView };

export const useCameraPermissions = createPermissionHook({
  getMethod: () => CameraManager.getCameraPermissionsAsync(),
  requestMethod: () => CameraManager.requestCameraPermissionsAsync(),
});
