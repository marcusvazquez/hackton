import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    default: {},
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {},
  }),
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.12,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 10 },
    default: {},
  }),
  nav: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.05,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -4 },
    },
    android: { elevation: 12 },
    default: {},
  }),
} as const;

export const glass = {
  light: 'rgba(255, 255, 255, 0.85)',
  medium: 'rgba(255, 255, 255, 0.65)',
  dark: 'rgba(241, 245, 249, 0.85)',
  border: 'rgba(203, 213, 225, 0.45)',
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;
