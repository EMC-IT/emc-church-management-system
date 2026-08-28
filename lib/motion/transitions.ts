/**
 * Centralized easing curves, duration presets, and spring configurations
 * for the Empowerment Mountain Church motion system.
 *
 * Adheres to "quiet confidence" — smooth, editorial, and performance-conscious.
 */

export const easings = {
  // Editorial smooth entry (Apple/Stripe style)
  editorial: [0.16, 1, 0.3, 1] as const,
  // Snappy responsive UI transitions
  snappy: [0.25, 0.1, 0.25, 1] as const,
  // Gentle deceleration
  gentle: [0, 0, 0.2, 1] as const,
  // Soft acceleration and deceleration
  smoothInOut: [0.65, 0, 0.35, 1] as const,
};

export const durations = {
  micro: 0.2,
  small: 0.35,
  standard: 0.55,
  editorial: 0.8,
  cinematic: 1.1,
};

export const springPresets = {
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  },
  tactile: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 0.5,
  },
  subtle: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 18,
    mass: 1,
  },
};
