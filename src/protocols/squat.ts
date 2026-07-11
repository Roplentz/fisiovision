import { aggregateConfidence } from "../confidence.js";
import { angleDegrees, inclinationFromVertical, midpoint } from "../kinematics.js";
import { mean, percentile } from "../math.js";
import { assessQuality } from "../quality.js";
import { segmentSquats, type SquatSample } from "../segmentation.js";
import type { EngineResult, Landmark, MetricValue, PoseFrame } from "../types.js";

const IDX = { leftShoulder: 11, rightShoulder: 12, leftHip: 23, rightHip: 24, leftKnee: 25, rightKnee: 26, leftAnkle: 27, rightAnkle: 28 } as const;
const REQUIRED = Object.values(IDX);
const DISCLAIMER = "Estimativa 2D para apoio à decisão. Requer confirmação profissional e não constitui diagnóstico.";

function landmark(frame: PoseFrame, index: number): Landmark {
  return frame.landmarks[index]!;
}

export function runSquatProtocol(frames: readonly PoseFrame[], now = new Date()): EngineResult {
  const quality = assessQuality(frames, {
    requiredLandmarkIndexes: REQUIRED,
    minimumVisibility: 0.5,
    minimumValidFrameRate: 0.7,
    minimumFrames: 10,
  });
  if (!quality.accepted) return result([], quality, 0, now);

  const samples: SquatSample[] = [];
  const leftAngles: number[] = [];
  const rightAngles: number[] = [];
  const trunkAngles: number[] = [];
  for (const frame of frames) {
    const hip = midpoint(landmark(frame, IDX.leftHip), landmark(frame, IDX.rightHip));
    const shoulder = midpoint(landmark(frame, IDX.leftShoulder), landmark(frame, IDX.rightShoulder));
    const left = angleDegrees(landmark(frame, IDX.leftHip), landmark(frame, IDX.leftKnee), landmark(frame, IDX.leftAnkle));
    const right = angleDegrees(landmark(frame, IDX.rightHip), landmark(frame, IDX.rightKnee), landmark(frame, IDX.rightAnkle));
    const trunk = inclinationFromVertical(shoulder, hip);
    if (left === null || right === null || trunk === null) continue;
    samples.push({ timestampMs: frame.timestampMs, hipY: hip.y, kneeAngle: mean([left, right]) });
    leftAngles.push(left);
    rightAngles.push(right);
    trunkAngles.push(trunk);
  }

  const repetitions = segmentSquats(samples);
  if (repetitions.length === 0) {
    quality.accepted = false;
    quality.reasons.push({ code: "incomplete_cycle", message: "Nenhuma repetição completa foi detectada." });
    return result([], quality, 0, now);
  }

  const durations = repetitions.map((rep) => (samples[rep.endIndex]!.timestampMs - samples[rep.startIndex]!.timestampMs) / 1000);
  const metrics: MetricValue[] = [
    metric("repetition_count", repetitions.length, "count", quality.validFrameRate),
    metric("repetition_time", mean(durations), "s", quality.validFrameRate),
    metric("knee_flexion_range_left", Math.max(...leftAngles) - Math.min(...leftAngles), "deg", quality.validFrameRate),
    metric("knee_flexion_range_right", Math.max(...rightAngles) - Math.min(...rightAngles), "deg", quality.validFrameRate),
    metric("trunk_inclination_p95", percentile(trunkAngles, 0.95), "deg", quality.validFrameRate),
  ];
  return result(metrics, quality, aggregateConfidence(quality, repetitions.length / (repetitions.length + 1)), now);
}

function metric(id: string, value: number, unit: string, confidence: number): MetricValue {
  return { id, value: Number(value.toFixed(3)), unit, confidence };
}

function result(metrics: MetricValue[], quality: ReturnType<typeof assessQuality>, confidence: number, now: Date): EngineResult {
  return {
    schemaVersion: "fisiovision-engine-v0.1",
    protocolId: "squat",
    protocolVersion: "0.1.0",
    status: quality.accepted ? "accepted" : "rejected",
    quality,
    metrics,
    confidence,
    reasons: quality.reasons,
    generatedAt: now.toISOString(),
    disclaimer: DISCLAIMER,
  };
}
