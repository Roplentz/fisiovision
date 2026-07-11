import type { PoseFrame } from "./types.js";

export function nearestFrame(frames: readonly PoseFrame[], timestampMs: number): PoseFrame | undefined {
  if (frames.length === 0 || !Number.isFinite(timestampMs)) return undefined;
  let low = 0;
  let high = frames.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const value = frames[middle]!.timestampMs;
    if (value === timestampMs) return frames[middle];
    if (value < timestampMs) low = middle + 1;
    else high = middle - 1;
  }
  const before = frames[Math.max(0, high)];
  const after = frames[Math.min(frames.length - 1, low)];
  if (!before) return after;
  if (!after) return before;
  return Math.abs(before.timestampMs - timestampMs) <= Math.abs(after.timestampMs - timestampMs) ? before : after;
}

export interface CanvasPoint {
  x: number;
  y: number;
  visible: boolean;
}

export function landmarkToCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
  visibility = 1,
  minimumVisibility = 0.5,
): CanvasPoint {
  return {
    x: x * width,
    y: y * height,
    visible: Number.isFinite(x) && Number.isFinite(y) && visibility >= minimumVisibility,
  };
}
