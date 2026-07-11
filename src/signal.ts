import { finiteOr } from "./math.js";

export function exponentialMovingAverage(values: readonly number[], alpha = 0.35): number[] {
  if (values.length === 0) return [];
  const safeAlpha = Math.min(1, Math.max(0.01, finiteOr(alpha, 0.35)));
  const output: number[] = [finiteOr(values[0] ?? 0)];
  for (let index = 1; index < values.length; index += 1) {
    const current = finiteOr(values[index] ?? output[index - 1] ?? 0, output[index - 1] ?? 0);
    const previous = output[index - 1] ?? current;
    output.push(safeAlpha * current + (1 - safeAlpha) * previous);
  }
  return output;
}

export function interpolateShortGaps(values: readonly (number | null)[], maximumGap = 3): number[] {
  const result = values.map((value) => (value !== null && Number.isFinite(value) ? value : null));
  let index = 0;
  while (index < result.length) {
    if (result[index] !== null) { index += 1; continue; }
    const start = index;
    while (index < result.length && result[index] === null) index += 1;
    const end = index;
    const gap = end - start;
    const left = start > 0 ? result[start - 1] : null;
    const right = end < result.length ? result[end] : null;
    if (gap <= maximumGap && left !== null && right !== null) {
      for (let offset = 0; offset < gap; offset += 1) {
        result[start + offset] = left + (right - left) * ((offset + 1) / (gap + 1));
      }
    }
  }
  return result.map((value, i) => finiteOr(value ?? result[i - 1] ?? result[i + 1] ?? 0));
}
