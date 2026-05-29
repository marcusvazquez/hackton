import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { findTouchExploreTargetAt } from '../utils/touchExploreRegistry';

type Props = {
  children: React.ReactNode;
  enabled: boolean;
};

export function ExploreByTouchLayer({ children, enabled }: Props) {
  const lastTargetId = useRef<string | null>(null);

  if (!enabled) {
    return <>{children}</>;
  }

  const pan = Gesture.Pan()
    .minDistance(5)
    .onUpdate((event) => {
      const target = findTouchExploreTargetAt(event.absoluteX, event.absoluteY);
      if (!target || target.id === lastTargetId.current) return;
      lastTargetId.current = target.id;
      const announcement = target.hint ? `${target.label}. ${target.hint}` : target.label;
      AccessibilityInfo.announceForAccessibility(announcement);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })
    .onEnd(() => {
      lastTargetId.current = null;
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.flex}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
