import { Platform } from 'react-native';

const CSS = `
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
body.reduce-motion *, body.reduce-motion *::before, body.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
`;

export function ReduceMotionStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return null;
  }

  const existing = document.getElementById('reduce-motion-styles');
  if (!existing) {
    const style = document.createElement('style');
    style.id = 'reduce-motion-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  return null;
}
