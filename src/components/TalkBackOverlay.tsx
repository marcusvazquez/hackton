import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { colors } from '../theme/colors';

type Props = {
  targetEnabled: boolean;
  onDone: () => void;
};

export function TalkBackOverlay({ targetEnabled, onDone }: Props) {
  const { systemReduceMotion } = useAccessibility();
  const [showBanner, setShowBanner] = useState(false);
  const flashOpacity = useSharedValue(0);
  const borderStagger = useSharedValue(0);

  useEffect(() => {
    if (systemReduceMotion) {
      onDone();
      return;
    }

    flashOpacity.value = withTiming(0.15, { duration: 200 }, () => {
      flashOpacity.value = withTiming(0, { duration: 200 });
    });

    borderStagger.value = withTiming(1, { duration: 300 });
    setShowBanner(true);

    const timer = setTimeout(() => {
      setShowBanner(false);
      onDone();
    }, 2000);

    return () => clearTimeout(timer);
  }, [systemReduceMotion, onDone, flashOpacity, borderStagger]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  if (!showBanner && systemReduceMotion) return null;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.flash, flashStyle]}
      />
      {showBanner && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.bannerWrap}
        >
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {targetEnabled
                ? 'Modo lector de pantalla activado'
                : 'Modo lector de pantalla desactivado'}
            </Text>
          </View>
        </Animated.View>
      )}
      {targetEnabled && Platform.OS === 'web' && (
        <TalkBackBorderHints />
      )}
    </>
  );
}

function TalkBackBorderHints() {
  const { systemReduceMotion } = useAccessibility();
  const hints = ['header', 'nav', 'content', 'actions'];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {hints.map((key, index) => (
        <Animated.View
          key={key}
          entering={
            systemReduceMotion
              ? undefined
              : FadeIn.delay(index * 30).duration(150)
          }
          style={[
            styles.borderHint,
            {
              top: 48 + index * 80,
              left: 12,
              right: 12,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    backgroundColor: '#ffffff',
    zIndex: 100,
  },
  bannerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,
  },
  banner: {
    backgroundColor: colors.talkBackBlue,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    maxWidth: '85%',
  },
  bannerText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  borderHint: {
    position: 'absolute',
    height: 48,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 8,
  },
});
