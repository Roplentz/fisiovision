import { mean } from "./math.js";
import type { CanonicalJoint, CanonicalSkeleton } from "./skeleton.js";

export interface SegmentDefinition { id: string; proximal: CanonicalJoint; distal: CanonicalJoint }
export interface SegmentConsistency {
  id: string;
  meanLength: number;
  coefficientOfVariation: number;
  accepted: boolean;
  validFrames: number;
}

export function evaluateSegmentConsistency(
  frames: readonly CanonicalSkeleton[],
  segments: readonly SegmentDefinition[],
  maximumCoefficientOfVariation = 0.08,
): SegmentConsistency[] {
  return segments.map((segment) => {
    const lengths = frames.flatMap((frame) => {
      const a = frame[segment.proximal], b = frame[segment.distal];
      return a && b ? [Math.hypot(a.x - b.x, a.y - b.y)] : [];
    }).filter((value) => value > 0 && Number.isFinite(value));
    const average = mean(lengths);
    const variance = lengths.length ? mean(lengths.map((value) => (value - average) ** 2)) : 0;
    const cv = average > 0 ? Math.sqrt(variance) / average : Infinity;
    return { id: segment.id, meanLength: average, coefficientOfVariation: cv, accepted: lengths.length >= 3 && cv <= maximumCoefficientOfVariation, validFrames: lengths.length };
  });
}
