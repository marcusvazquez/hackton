import { useCallback, useEffect, useId, useRef } from 'react';
import { View } from 'react-native';
import {
  registerTouchExploreTarget,
  unregisterTouchExploreTarget,
} from '../utils/touchExploreRegistry';

export function useTouchExploreTarget(label: string, hint?: string) {
  const id = useId();
  const viewRef = useRef<View>(null);

  const measureAndRegister = useCallback(() => {
    viewRef.current?.measureInWindow((pageX, pageY, width, height) => {
      registerTouchExploreTarget({
        id,
        label,
        hint,
        bounds: { width, height, x: 0, y: 0 },
        pageX,
        pageY,
      });
    });
  }, [hint, id, label]);

  const onLayout = useCallback(() => {
    measureAndRegister();
  }, [measureAndRegister]);

  useEffect(() => {
    return () => {
      unregisterTouchExploreTarget(id);
    };
  }, [id]);

  return { ref: viewRef, onLayout };
}
