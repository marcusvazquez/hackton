import * as Haptics from 'expo-haptics';

/** Niveles de proximidad: 0 = seguro, 3 = muy cerca */
type ProximityLevel = 0 | 1 | 2 | 3;

const THROTTLE_MS = 100;

/**
 * Niveles de proximidad:
 * 0: Sin vibración (lejos)
 * 1: Vibración ligera y muy espaciada
 * 2: Vibración media y moderada
 * 3: Vibración fuerte y frecuente
 */
function distanceToLevel(distanceMeters: number): ProximityLevel {
  if (distanceMeters >= 2.0) return 0;
  if (distanceMeters >= 1.5) return 1;
  if (distanceMeters >= 0.7) return 2;
  return 3;
}

class ProximityHapticsService {
  private interval: ReturnType<typeof setInterval> | null = null;
  private lastLevel: ProximityLevel | null = null;
  private active = false;
  private lastUpdateAt = 0;

  /**
   * Actualiza vibración progresiva según distancia en metros.
   * Throttle interno: máximo una vez cada 100 ms.
   */
  update(distanceMeters: number): void {
    const now = Date.now();
    if (now - this.lastUpdateAt < THROTTLE_MS) {
      return;
    }
    this.lastUpdateAt = now;

    const level = distanceToLevel(distanceMeters);

    if (level === this.lastLevel) {
      return;
    }

    this.lastLevel = level;
    this.clearInterval();

    switch (level) {
      case 0:
        this.active = false;
        return;
      case 1:
        this.active = true;
        this.interval = setInterval(() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 1200);
        return;
      case 2:
        this.active = true;
        this.interval = setInterval(() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 600);
        return;
      case 3:
        this.active = true;
        this.interval = setInterval(() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 280);
        return;
      default:
        this.active = false;
    }
  }

  private clearInterval(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  stop(): void {
    this.clearInterval();
    this.lastLevel = null;
    this.active = false;
    this.lastUpdateAt = 0;
  }

  isActive(): boolean {
    return this.active;
  }
}

export const proximityHaptics = new ProximityHapticsService();
