import { LayoutRectangle } from 'react-native';

export type TouchExploreEntry = {
  id: string;
  label: string;
  hint?: string;
  bounds: LayoutRectangle;
  pageX: number;
  pageY: number;
};

const entries = new Map<string, TouchExploreEntry>();

export function registerTouchExploreTarget(entry: TouchExploreEntry): void {
  entries.set(entry.id, entry);
}

export function unregisterTouchExploreTarget(id: string): void {
  entries.delete(id);
}

export function findTouchExploreTargetAt(x: number, y: number): TouchExploreEntry | null {
  for (const entry of entries.values()) {
    const left = entry.pageX;
    const top = entry.pageY;
    const right = left + entry.bounds.width;
    const bottom = top + entry.bounds.height;
    if (x >= left && x <= right && y >= top && y <= bottom) {
      return entry;
    }
  }
  return null;
}

export function clearTouchExploreTargets(): void {
  entries.clear();
}
