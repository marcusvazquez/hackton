import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTouchExploreTarget } from '../hooks/useTouchExploreTarget';
import { spacing } from '../theme/colors';
import { HACKATHON_TAB_LABELS, hackathonTypography } from '../theme/hackathonLayout';
import { radii, shadows } from '../theme/shadows';
import { TAB_LABELS, TAB_ORDER, TabId } from '../types/navigation';
import { playNavigationSound } from '../utils/talkbackSounds';

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const TAB_WIDTH = 72;

const TAB_HINTS: Record<TabId, string> = {
  mapa: 'Abre el mapa con rutas y barreras accesibles',
  planear: 'Planifica una ruta accesible a tu destino',
  reportar: 'Reporta una barrera u obstáculo en el camino',
  comunidad: 'Consulta los reportes compartidos por la comunidad',
};

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
  labelFont,
  minTouchTarget,
  simplifiedUI,
  fullA11y,
  fontSize,
  isHackathon,
  tabLabel,
}: {
  tab: TabId;
  isActive: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  labelFont: string;
  minTouchTarget: number;
  simplifiedUI: boolean;
  fullA11y: boolean;
  fontSize: number;
  isHackathon: boolean;
  tabLabel: string;
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

  const hint = TAB_HINTS[tab];
  const { ref: exploreRef, onLayout: onExploreLayout } = useTouchExploreTarget(
    fullA11y ? `Pestaña ${tabLabel}` : tabLabel,
    fullA11y ? hint : undefined,
  );

  return (
    <Pressable
      ref={exploreRef}
      onLayout={onExploreLayout}
      accessible
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={fullA11y ? `Pestaña ${tabLabel}` : tabLabel}
      accessibilityHint={fullA11y ? hint : undefined}
      onPress={onPress}
      style={[
        styles.tabButton,
        isHackathon && styles.tabButtonHackathon,
        { minHeight: minTouchTarget },
      ]}
    >
      {!simplifiedUI ? (
        <Animated.View style={iconStyle}>
          <MaterialIcons
            name={icons[tab]}
            size={isHackathon ? 22 : 24}
            color={isActive ? activeColor : inactiveColor}
          />
        </Animated.View>
      ) : null}
      <Animated.Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[
          styles.tabLabel,
          simplifiedUI && styles.tabLabelSimplified,
          !isHackathon && styles.tabLabelUppercase,
          isHackathon && styles.tabLabelHackathon,
          {
            fontFamily: labelFont,
            fontSize,
            lineHeight: isHackathon ? fontSize + 2 : undefined,
            color: isActive ? activeColor : inactiveColor,
          },
          labelStyle,
        ]}
      >
        {tabLabel}
      </Animated.Text>
    </Pressable>
  );
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  const insets = useSafeAreaInsets();
  const { reduceMotion, talkBackEnabled, speak, personType } = useAccessibility();
  const adaptive = useAdaptiveUI();
  const { colors, glass, isHackathon, fontBold, fontNav } = useAppTheme();
  const { navEase } = useAnimations();
  const activeIndex = TAB_ORDER.indexOf(activeTab);
  const [trackWidth, setTrackWidth] = useState(0);
  const tabWidth = trackWidth > 0 ? trackWidth / TAB_ORDER.length : TAB_WIDTH;
  const indicatorX = useSharedValue(activeIndex * tabWidth);
  const fullA11y = personType === 'visual';
  const tabLabels = isHackathon ? HACKATHON_TAB_LABELS : TAB_LABELS;
  const navFontSize = isHackathon
    ? hackathonTypography.bodySm
    : adaptive.simplifiedUI
      ? adaptive.fontSize
      : 12;

  useEffect(() => {
    const x = activeIndex * tabWidth;
    indicatorX.value = reduceMotion
      ? x
      : withTiming(x, { duration: 300, easing: navEase });
  }, [activeIndex, indicatorX, navEase, reduceMotion, tabWidth]);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      onTabChange(tab);
      if (talkBackEnabled) {
        playNavigationSound();
        void speak(`Pestaña ${tabLabels[tab]} seleccionada`);
      } else if (adaptive.useHaptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [adaptive.useHaptics, onTabChange, tabLabels, talkBackEnabled, speak],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const navMinHeight = personType === 'motriz' ? 72 : undefined;

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={[
          styles.container,
          navMinHeight != null && { minHeight: navMinHeight },
          shadows.nav,
          isHackathon && styles.containerHackathon,
          { backgroundColor: glass.light, borderColor: glass.border },
        ]}
      >
        <View style={styles.indicatorTrack}>
          <Animated.View
            style={[
              styles.indicator,
              { width: tabWidth, backgroundColor: colors.primary },
              indicatorStyle,
              isHackathon && {
                shadowColor: colors.primary,
                shadowOpacity: 0.8,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          />
        </View>
        <View
          style={styles.tabsRow}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          {TAB_ORDER.map((tab) => (
            <TabButton
              key={tab}
              tab={tab}
              isActive={activeTab === tab}
              onPress={() => handleTabChange(tab)}
              activeColor={colors.primary}
              inactiveColor={colors.onSurfaceVariant}
              labelFont={isHackathon ? fontNav : fontBold}
              minTouchTarget={adaptive.minTouchTarget}
              simplifiedUI={adaptive.simplifiedUI}
              fullA11y={fullA11y}
              fontSize={navFontSize}
              isHackathon={isHackathon}
              tabLabel={tabLabels[tab]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  container: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingTop: 8,
    paddingBottom: 4,
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
    height: 3,
    borderRadius: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tabButton: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabButtonHackathon: {
    flex: 1,
    width: undefined,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  tabLabel: {
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  tabLabelUppercase: {
    textTransform: 'uppercase',
  },
  tabLabelHackathon: {
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 2,
  },
  tabLabelSimplified: {
    textTransform: 'none',
    marginTop: 0,
  },
});
