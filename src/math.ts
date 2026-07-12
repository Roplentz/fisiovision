export function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function finiteOr(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

export function mean(values: readonly number[]): number {
  const clean = values.filter(Number.isFinite);
  if (clean.length === 0) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

export function median(values: readonly number[]): number {
  const clean = [...values.filter(Number.isFinite)].sort((a: number, b: number) => a - b);
  if (clean.length === 0) return 0;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 === 0
    ? ((clean[middle - 1] ?? 0) + (clean[middle] ?? 0)) / 2
    : (clean[middle] ?? 0);
}

export function percentile(values: readonly number[], probability: number): number {
  const clean = [...values.filter(Number.isFinite)].sort((a: number, b: number) => a - b);
  if (clean.length === 0) return 0;
  const p = clamp(probability);
  const index = (clean.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return finiteOr((clean[lower] ?? 0) * (1 - weight) + (clean[upper] ?? 0) * weight);
}
