interface PercentOption {
  min?: number;
  max?: number;
  minPercent?: number;
}

/**
 * Standard percentage calculation formula
 * @param value Value
 * @param option Percentage calculation configuration
 */
export const formatPercent = (
  value = 0,
  { min = 0, max = 1000, minPercent = 0 }: PercentOption = {}
): number => {
  return Math.min(100, Math.round(((100 - minPercent) * (value - min)) / (max - min) + minPercent));
};
