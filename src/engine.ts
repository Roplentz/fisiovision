import { aggregateConfidence } from "./confidence.js";
import { assessQuality } from "./quality.js";
import type { EngineResult, PoseFrame, QualityRequirements } from "./types.js";

export interface ProtocolDefinition {
  id: string;
  version: string;
  quality: QualityRequirements;
}

const DISCLAIMER =
  "Estimativa automática para apoio à decisão. Requer confirmação profissional e não constitui diagnóstico.";

export function runProtocol(
  frames: readonly PoseFrame[],
  protocol: ProtocolDefinition,
  now = new Date(),
): EngineResult {
  const quality = assessQuality(frames, protocol.quality);
  const confidence = aggregateConfidence(quality, 0);
  return {
    schemaVersion: "fisiovision-engine-v0.1",
    protocolId: protocol.id,
    protocolVersion: protocol.version,
    status: quality.accepted ? "accepted" : "rejected",
    quality,
    metrics: [],
    confidence,
    reasons: quality.reasons,
    generatedAt: now.toISOString(),
    disclaimer: DISCLAIMER,
  };
}
