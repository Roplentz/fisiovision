export interface SamplingPlan {
  fps: number;
  durationMs: number;
  timestampsMs: number[];
}

export function createSamplingPlan(durationSeconds: number, fps = 15, maximumFrames = 9_000): SamplingPlan {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error("durationSeconds must be greater than zero");
  if (!Number.isFinite(fps) || fps <= 0 || fps > 60) throw new Error("fps must be between 0 and 60");
  if (!Number.isInteger(maximumFrames) || maximumFrames <= 0) throw new Error("maximumFrames must be a positive integer");
  const durationMs = durationSeconds * 1000;
  const stepMs = 1000 / fps;
  const count = Math.min(maximumFrames, Math.floor(durationSeconds * fps + Number.EPSILON * 10) + 1);
  return {
    fps,
    durationMs,
    timestampsMs: Array.from({ length: count }, (_, index) => Math.min(durationMs, index * stepMs)),
  };
}

export function extractionProgress(processedFrames: number, totalFrames: number): number {
  if (totalFrames <= 0) return 0;
  return Math.max(0, Math.min(1, processedFrames / totalFrames));
}
