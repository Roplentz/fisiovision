import { clamp, mean } from "./math.js";
import type { PoseFrame, QualityReport, QualityRequirements, RejectionReason } from "./types.js";

function frameVisibility(frame: PoseFrame, indexes: readonly number[], minimum: number): { valid: boolean; mean: number } {
  const values: number[] = [];
  for (const index of indexes) {
    const landmark = frame.landmarks[index];
    if (!landmark || !Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) {
      return { valid: false, mean: 0 };
    }
    values.push(clamp(landmark.visibility ?? 0));
  }
  const visibility = mean(values);
  return { valid: values.every((value) => value >= minimum), mean: visibility };
}

export function assessQuality(frames: readonly PoseFrame[], requirements: QualityRequirements): QualityReport {
  const reasons: RejectionReason[] = [];
  if (frames.length < requirements.minimumFrames) {
    reasons.push({
      code: "insufficient_landmarks",
      message: "Quantidade de frames insuficiente para análise confiável.",
      details: { frames: frames.length, minimum: requirements.minimumFrames },
    });
  }

  let validFrames = 0;
  const visibility: number[] = [];
  let previousTimestamp = -Infinity;

  frames.forEach((frame, frameIndex) => {
    if (!Number.isFinite(frame.timestampMs) || frame.timestampMs <= previousTimestamp) {
      reasons.push({ code: "invalid_timestamps", message: "Timestamps ausentes ou fora de ordem.", frameIndex });
    }
    previousTimestamp = frame.timestampMs;
    const result = frameVisibility(frame, requirements.requiredLandmarkIndexes, requirements.minimumVisibility);
    visibility.push(result.mean);
    if (result.valid) validFrames += 1;
  });

  const validFrameRate = frames.length === 0 ? 0 : validFrames / frames.length;
  if (validFrameRate < requirements.minimumValidFrameRate) {
    reasons.push({
      code: "low_visibility",
      message: "Taxa de frames válidos abaixo do mínimo do protocolo.",
      details: { validFrameRate, minimum: requirements.minimumValidFrameRate },
    });
  }

  return {
    accepted: reasons.length === 0,
    totalFrames: frames.length,
    validFrames,
    validFrameRate: clamp(validFrameRate),
    meanVisibility: clamp(mean(visibility)),
    reasons,
  };
}
