import React from 'react';
import { StyleSheet, View } from 'react-native';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { MapFiltersPanel } from '../components/MapFiltersPanel';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { StatusCard } from '../components/StatusCard';
import { VoiceAssistantCard } from '../components/VoiceAssistantCard';
import { useAppTheme } from '../hooks/useAppTheme';

type Props = {
  onOpenDetail: () => void;
  onReport: () => void;
};

export function MapScreen({ onOpenDetail, onReport }: Props) {
  const { colors, isHackathon } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceDim }]}>
      <View style={styles.mapArea}>
        <InteractiveMap />

        <View style={styles.uiLayer} pointerEvents="box-none">
          <SearchBar />
          <VoiceAssistantCard />
          {isHackathon ? (
            <View style={styles.filtersWrap}>
              <MapFiltersPanel />
            </View>
          ) : null}
          <StatusCard onPressVer={onOpenDetail} />
          <ReportFab onPress={onReport} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  filtersWrap: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    zIndex: 15,
  },
});
