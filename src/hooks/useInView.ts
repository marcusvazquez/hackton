import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

export function useInView(threshold = 0.2) {
  const ref = useRef<View>(null);
  const [inView, setInView] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const node = ref.current as unknown as Element | null;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
