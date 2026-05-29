import { useMemo } from 'react';
import { Easing, FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';

const bounceEase = Easing.bezier(0.34, 1.56, 0.64, 1);
const smoothEase = Easing.bezier(0.16, 1, 0.3, 1);
const navEase = Easing.bezier(0.4, 0, 0.2, 1);

export function useAnimations() {
  const { reduceMotion } = useAccessibility();

  return useMemo(
    () => ({
      reduceMotion,
      screenEnter: reduceMotion
        ? undefined
        : FadeInDown.duration(280).easing(bounceEase),
      screenExit: reduceMotion ? undefined : FadeIn.duration(1),
      markerEnter: (index: number) =>
        reduceMotion
          ? undefined
          : ZoomIn.duration(320)
              .delay(index * 120)
              .springify()
              .damping(20)
              .stiffness(300),
      statusCardEnter: reduceMotion
        ? undefined
        : FadeInUp.duration(400).delay(600).easing(smoothEase),
      fabEnter: reduceMotion
        ? undefined
        : ZoomIn.duration(400)
            .delay(800)
            .springify()
            .damping(17)
            .stiffness(400),
      chipEnter: (index: number) =>
        reduceMotion
          ? undefined
          : ZoomIn.duration(200)
              .delay(index * 50)
              .easing(Easing.out(Easing.quad)),
      feedEnter: reduceMotion
        ? undefined
        : FadeInDown.duration(300).easing(Easing.out(Easing.quad)),
      bounceEase,
      smoothEase,
      navEase,
    }),
    [reduceMotion],
  );
}
