import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimations } from '../hooks/useAnimations';

type Props = {
  screenKey: string;
  children: React.ReactNode;
};

export function ScreenTransition({ screenKey, children }: Props) {
  const { screenEnter } = useAnimations();

  return (
    <Animated.View
      key={screenKey}
      entering={screenEnter}
      style={styles.container}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
