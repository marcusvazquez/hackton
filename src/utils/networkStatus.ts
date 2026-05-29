import { Platform } from 'react-native';
import type { NetInfoState } from '@react-native-community/netinfo';

/** NetInfo often reports null on web/mobile while checking; treat as online unless explicitly false. */
export function isNetworkOnline(state: NetInfoState): boolean {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }
  if (state.isConnected === false) {
    return false;
  }
  if (state.isInternetReachable === false) {
    return false;
  }
  return true;
}
