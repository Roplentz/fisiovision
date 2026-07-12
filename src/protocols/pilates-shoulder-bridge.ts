import { aggregateConfidence } from "../confidence.js";
import { angleDegrees } from "../kinematics.js";
import { mean } from "../math.js";
import { assessQuality } from "../quality.js";
import type { EngineResult, MetricValue, PoseFrame } from "../types.js";

export type BodySide = "left" | "right";
export interface PilatesShoulderBridgeOptions {
  side?: BodySide;
  minimumNormalizedLift?: number;
  returnTolerance?: number;
  minimumRepetitionDurationMs?: number;
}
const DISCLAIMER = "Estimativa 2D do Shoulder Bridge para pesquisa e apoio à decisão. Requer confirmação profissional e não constitui diagnóstico.";

export function runPilatesShoulderBridgeProtocol(
  frames: readonly PoseFrame[],
  options: PilatesShoulderBridgeOptions = {},
  now = new Date(),
): EngineResult {
  const side = options.side ?? "left";
  const indexes = side === "left" ? { shoulder: 11, hip: 23, knee: 25, ankle: 27 } : { shoulder: 12, hip: 24, knee: 26, ankle: 28 };
  const quality = assessQuality(frames, {
    requiredLandmarkIndexes: Object.values(indexes),
    minimumVisibility: .5,
    minimumValidFrameRate: .7,
    minimumFrames: 10,
  });
  if (!quality.accepted) return result([], quality, 0, now);

  const first = frames[0]!;
  const initialShoulder = first.landmarks[indexes.shoulder]!;
  const initialHip = first.landmarks[indexes.hip]!;
  const torsoLength = Math.hypot(initialShoulder.x - initialHip.x, initialShoulder.y - initialHip.y);
  if (!Number.isFinite(torsoLength) || torsoLength <= 0) {
    quality.accepted = false;
    quality.reasons.push({ code: "invalid_frame", message: "Comprimento aparente do tronco inválido." });
    return result([], quality, 0, now);
  }

  const samples = frames.flatMap((frame) => {
    const shoulder = frame.landmarks[indexes.shoulder], hip = frame.landmarks[indexes.hip];
    const knee = frame.landmarks[indexes.knee], ankle = frame.landmarks[indexes.ankle];
    if (!shoulder || !hip || !knee || !ankle) return [];
    const angle = angleDegrees(shoulder, hip, knee);
    if (angle === null) return [];
    return [{ timestampMs: frame.timestampMs, normalizedLift: (initialHip.y - hip.y) / torsoLength, hipAngle: angle }];
  });
  const minimumLift = options.minimumNormalizedLift ?? .15;
  const returnTolerance = options.returnTolerance ?? .06;
  const minimumDuration = options.minimumRepetitionDurationMs ?? 500;
  const repetitions: Array<{ start: number; end: number }> = [];
  let start = -1;
  samples.forEach((sample, index) => {
    if (start < 0 && sample.normalizedLift >= minimumLift) start = index;
    if (start >= 0 && sample.normalizedLift <= returnTolerance) {
      if (sample.timestampMs - samples[start]!.timestampMs >= minimumDuration) repetitions.push({ start, end: index });
      start = -1;
    }
  });
  if (repetitions.length === 0) {
    quality.accepted = false;
    quality.reasons.push({
      code: "incomplete_cycle",
      message: "Nenhum ciclo completo de elevação e retorno foi detectado.",
      details: { maximumNormalizedLift: Math.max(...samples.map((sample) => sample.normalizedLift)), minimumNormalizedLift: minimumLift },
    });
    return result([], quality, 0, now);
  }

  const hipAngles = samples.map((sample) => sample.hipAngle);
  const durations = repetitions.map((rep) => (samples[rep.end]!.timestampMs - samples[rep.start]!.timestampMs) / 1000);
  const confidence = aggregateConfidence(quality, samples.length / frames.length);
  return result([
    metric("repetition_count", repetitions.length, "count", confidence),
    metric("shoulder_bridge_hip_angle_range", Math.max(...hipAngles) - Math.min(...hipAngles), "deg", confidence),
    metric("shoulder_bridge_pelvic_lift_max", Math.max(...samples.map((sample) => sample.normalizedLift)), "torso_ratio", confidence),
    metric("repetition_time", mean(durations), "s", confidence),
  ], quality, confidence, now);
}
function metric(id:string,value:number,unit:string,confidence:number):MetricValue{return{id,value:Number(value.toFixed(3)),unit,confidence}}
function result(metrics:MetricValue[],quality:ReturnType<typeof assessQuality>,confidence:number,now:Date):EngineResult{return{schemaVersion:"fisiovision-engine-v0.1",protocolId:"pilates-shoulder-bridge",protocolVersion:"0.1.0",status:quality.accepted?"accepted":"rejected",quality,metrics,confidence,reasons:quality.reasons,generatedAt:now.toISOString(),disclaimer:DISCLAIMER}}
