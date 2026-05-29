import { hackathonMapStack } from './hackathonLayout';
import { FLOATING_NAV_CLEARANCE, SCROLL_BOTTOM_INSET } from './layoutConstants';

export { FLOATING_NAV_CLEARANCE, SCROLL_BOTTOM_INSET } from './layoutConstants';

export const mapOverlay = {
  voiceCardTop: 130,
  statusCardBottom: 100,
  reportFabBottom: 180,
  aiFabBottom: 100,
};

export type MapOverlayInsets = {
  voiceCardTop: number;
  statusCardBottom: number;
  reportFabBottom: number;
  aiFabBottom: number;
  searchTop?: number;
  locationTop?: number;
  filtersTop?: number;
  alertStripTop?: number;
  statusCardRight?: number;
  voiceIndicatorBottom?: number;
};

/** Posiciones de overlays según tema visual (hackathon = pila más compacta). */
export function getMapOverlay(isHackathon: boolean): MapOverlayInsets {
  if (!isHackathon) {
    return { ...mapOverlay };
  }
  return {
    ...mapOverlay,
    voiceCardTop: 0,
    statusCardBottom: hackathonMapStack.statusCardBottom,
    reportFabBottom: hackathonMapStack.reportFabBottom,
    aiFabBottom: hackathonMapStack.aiFabBottom,
    searchTop: hackathonMapStack.searchTop,
    locationTop: hackathonMapStack.locationTop,
    filtersTop: hackathonMapStack.filtersTop,
    alertStripTop: hackathonMapStack.alertStripTop,
    statusCardRight: hackathonMapStack.statusCardRight,
    voiceIndicatorBottom: hackathonMapStack.voiceIndicatorBottom,
  };
}
