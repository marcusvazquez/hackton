import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';
import { TAB_LABELS, TAB_ORDER, TabId } from '../types/navigation';
import { playNavigationSound } from '../utils/talkbackSounds';

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const TAB_WIDTH = 72;

const icons: Record<TabId, keyof typeof MaterialIcons.glyphMap> = {
  mapa: 'map',
  planear: 'directions-walk',
  reportar: 'add-a-photo',
  comunidad: 'groups',
};

function TabButton({
  tab,
  isActive,
  onPress,
  activeColor,
  inactiveColor,
  fontBold,
}: {
  tab: TabId;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  fontBold: string;
}) {
  const { reduceMotion } = useAccessibility();
  const { navEase } = useAnimations();
  const iconY = useSharedValue(0);
  const labelOpacity = useSharedValue(isActive ? 1 : 0.6);
  const labelScale = useSharedValue(isActive ? 1 : 0.9);

  useEffect(() => {
    if (reduceMotion) {
      iconY.value = 0;
      labelOpacity.value = isActive ? 1 : 0.6;
      labelScale.value = isActive ? 1 : 0.9;
      return;
    }

    if (isActive) {
      iconY.value = withTiming(-3, { duration: 150, easing: navEase }, () => {
        iconY.value = withTiming(0, { duration: 150, easing: navEase });
      });
      labelOpacity.value = withTiming(1, { duration: 200 });
      labelScale.value = withTiming(1, { duration: 200 });
    } else {
      labelOpacity.value = withTiming(0.6, { duration: 200 });
      labelScale.value = withTiming(0.9, { duration: 200 });
    }
  }, [isActive, reduceMotion, iconY, labelOpacity, labelScale, navEase]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ scale: labelScale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={styles.tabButton}
    >
      <Animated.View style={iconStyle}>
        <MaterialIcons
          name={icons[tab]}
          size={24}
          color={isActive ? activeColor : inactiveColor}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.tabLabel,
          { fontFamily: fontBold, color: isActive ? activeColor : inactiveColor },
          labelStyle,
        ]}
      >
        {TAB_LABELS[tab]}
      </Animated.Text>
    </Pressable>
  );
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  const insets = useSafeAreaInsets();
  const { reduceMotion, talkBackEnabled, speak } = useAccessibility();
  const { colors, glass, isHackathon, fontBold } = useAppTheme();
  const { navEase } = useAnimations();
  const activeIndex = TAB_ORDER.indexOf(activeTab);
  const indicatorX = useSharedValue(activeIndex * TAB_WIDTH);

  useEffect(() => {
    indicatorX.value = reduceMotion
      ? activeIndex * TAB_WIDTH
      : withTiming(activeIndex * TAB_WIDTH, { duration: 300, easing: navEase });
  }, [activeIndex, indicatorX, navEase, reduceMotion]);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      onTabChange(tab);
      if (talkBackEnabled) {
        playNavigationSound();
        void speak(`Pestaña ${TAB_LABELS[tab]} seleccionada`);
      }
    },
    [onTabChange, talkBackEnabled, speak],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={[
          styles.container,
          shadows.nav,
          isHackathon && styles.containerHackathon,
          { backgroundColor: glass.light, borderColor: glass.border },
        ]}
      >
        <View style={styles.indicatorTrack}>
          <Animated.View
            style={[styles.indicator, { backgroundColor: colors.primary }, indicatorStyle]}
          />
        </View>
        <View style={styles.tabsRow}>
          {TAB_ORDER.map((tab) => (
            <TabButton
              key={tab}
              tab={tab}
              isActive={activeTab === tab}
              onPress={() => handleTabChange(tab)}
              activeColor={colors.primary}
              inactiveColor={colors.onSurfaceVariant}
              fontBold={fontBold}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  container: {
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingTop: 10,
    overflow: 'hidden',
  },
  containerHackathon: {
    shadowColor: '#00e5ff',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  indicatorTrack: {
    position: 'absolute',
    top: 0,
    left: spacing.edge,
    right: spacing.edge,
    height: 3,
  },
  indicator: {
    width: TAB_WIDTH,
    height: 3,
    borderRadius: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: spacing.touchMin,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
