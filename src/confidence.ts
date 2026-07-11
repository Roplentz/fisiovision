import { clamp } from "./math.js";
import type { QualityReport } from "./types.js";

export function aggregateConfidence(quality: QualityReport, metricCompleteness = 1): number {
  const score =
    quality.validFrameRate * 0.45 +
    quality.meanVisibility * 0.4 +
    clamp(metricCompleteness) * 0.15;
  return Math.round(clamp(score) * 1000) / 1000;
}
