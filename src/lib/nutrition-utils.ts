/**
 * Open Food Facts' raw `nutriscore_score` is an experimental scale where
 * LOWER is healthier and negative values are normal (e.g. water/veg score
 * below zero). It is NOT a 0–100 rating, so showing it as "X/100" produces
 * nonsense like negative percentages. Instead we derive a friendly 0–100
 * "healthiness" from the reliable A–E letter grade: higher = healthier.
 */
export function nutriHealthPercent(grade?: string): number | null {
  switch (grade?.trim().toUpperCase()) {
    case 'A':
      return 95;
    case 'B':
      return 75;
    case 'C':
      return 55;
    case 'D':
      return 35;
    case 'E':
      return 15;
    default:
      return null;
  }
}

/** Red (low) → green (high) fill color for a healthiness bar. */
export function healthBarColor(percent: number): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const hue = Math.round((clamped / 100) * 120); // 0 = red, 120 = green
  return `hsl(${hue}, 75%, 45%)`;
}
