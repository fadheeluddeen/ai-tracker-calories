/**
 * iOS-style Haptic Feedback Utility using the Web Vibration API
 * Safely executes physical vibration patterns to mimic Taptic Engine responses.
 */

export const isHapticsSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
};

/**
 * Light impact feedback (e.g., date scrub, theme switch, small buttons)
 * Mimics UIImpactFeedbackGenerator(style: .light)
 */
export const hapticLight = (): void => {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate(10);
    } catch {
      // ignore if restricted
    }
  }
};

/**
 * Medium impact feedback (e.g., snapping a photo, expanding/collapsing meal drawers)
 * Mimics UIImpactFeedbackGenerator(style: .medium)
 */
export const hapticMedium = (): void => {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate(18);
    } catch {
      // ignore if restricted
    }
  }
};

/**
 * Selection tick (e.g., switching tabs, segmented controls, quick toggles)
 * Mimics UISelectionFeedbackGenerator()
 */
export const hapticSelection = (): void => {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate(8);
    } catch {
      // ignore if restricted
    }
  }
};

/**
 * Success notification feedback (e.g., food logged, goal targets updated)
 * Mimics UINotificationFeedbackGenerator(type: .success)
 * Two crisp pulses: short tick -> brief rest -> firm confirmation pulse
 */
export const hapticSuccess = (): void => {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate([12, 45, 20]);
    } catch {
      // ignore if restricted
    }
  }
};

/**
 * Warning/Deletion feedback (e.g., removing a food item, a failed upload)
 * Mimics UINotificationFeedbackGenerator(type: .warning)
 */
export const hapticWarning = (): void => {
  if (isHapticsSupported()) {
    try {
      navigator.vibrate([16, 40, 22]);
    } catch {
      // ignore if restricted
    }
  }
};
