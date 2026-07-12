import { aggregateConfidence } from "../confidence.js";
import { midpoint } from "../kinematics.js";
import { assessQuality } from "../quality.js";
import type { EngineResult, MetricValue, PoseFrame } from "../types.js";

const REQUIRED = [11, 12, 23, 24] as const;
const DISCLAIMER = "Estimativa 2D de mobilidade lateral do tronco para pesquisa e apoio à decisão. Requer confirmação profissional e não constitui diagnóstico.";

export interface TrunkLateralFlexionOptions {
  minimumRangeDegrees?: number;
  smoothingAlpha?: number;
}

export function runTrunkLateralFlexionProtocol(
  frames: readonly PoseFrame[],
  options: TrunkLateralFlexionOptions = {},
  now = new Date(),
): EngineResult {
  const quality = assessQuality(frames, {
    requiredLandmarkIndexes: REQUIRED,
    minimumVisibility: 0.5,
    minimumValidFrameRate: 0.7,
    minimumFrames: 10,
  });
  if (!quality.accepted) return result([], quality, 0, now);

  const angles = frames.flatMap((frame) => {
    const leftShoulder = frame.landmarks[11], rightShoulder = frame.landmarks[12];
    const leftHip = frame.landmarks[23], rightHip = frame.landmarks[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return [];
    const shoulder = midpoint(leftShoulder, rightShoulder);
    const hip = midpoint(leftHip, rightHip);
    const dx = shoulder.x - hip.x;
    const dy = Math.abs(shoulder.y - hip.y);
    if (dx === 0 && dy === 0) return [];
    return [Math.atan2(dx, dy) * 180 / Math.PI];
  });
  const smoothed = exponentialSmooth(angles, options.smoothingAlpha ?? 0.25);
  const minimum = Math.min(...smoothed);
  const maximum = Math.max(...smoothed);
  const range = maximum - minimum;
  const minimumRange = options.minimumRangeDegrees ?? 8;
  if (smoothed.length < 10 || range < minimumRange) {
    quality.accepted = false;
    quality.reasons.push({
      code: "insufficient_depth",
      message: "Amplitude lateral insuficiente para caracterizar o movimento do tronco.",
      details: { rangeDegrees: Number.isFinite(range) ? range : 0, minimumRangeDegrees: minimumRange },
    });
    return result([], quality, 0, now);
  }

  const leftPeak = Math.max(0, maximum);
  const rightPeak = Math.max(0, -minimum);
  const larger = Math.max(leftPeak, rightPeak);
  const symmetry = larger === 0 ? 0 : Math.min(leftPeak, rightPeak) / larger;
  const completeness = Math.min(1, smoothed.length / frames.length);
  const confidence = aggregateConfidence(quality, completeness);
  const metrics: MetricValue[] = [
    metric("trunk_lateral_flexion_range", range, "deg", confidence),
    metric("trunk_lateral_flexion_left_peak", leftPeak, "deg", confidence),
    metric("trunk_lateral_flexion_right_peak", rightPeak, "deg", confidence),
    metric("trunk_lateral_flexion_symmetry", symmetry, "ratio", confidence),
  ];
  return result(metrics, quality, confidence, now);
}

function exponentialSmooth(values: readonly number[], alpha: number): number[] {
  if (alpha <= 0 || alpha > 1) throw new Error("smoothingAlpha must be in (0, 1]");
  if (values.length === 0) return [];
  const output = [values[0]!];
  for (let index = 1; index < values.length; index += 1) {
    output.push(alpha * values[index]! + (1 - alpha) * output[index - 1]!);
  }
  return output;
}
function metric(id: string, value: number, unit: string, confidence: number): MetricValue {
  return { id, value: Number(value.toFixed(3)), unit, confidence };
}
function result(metrics: MetricValue[], quality: ReturnType<typeof assessQuality>, confidence: number, now: Date): EngineResult {
  return {
    schemaVersion: "fisiovision-engine-v0.1", protocolId: "trunk-lateral-flexion",
    protocolVersion: "0.1.0", status: quality.accepted ? "accepted" : "rejected",
    quality, metrics, confidence, reasons: quality.reasons, generatedAt: now.toISOString(),
    disclaimer: DISCLAIMER,
  };
}
