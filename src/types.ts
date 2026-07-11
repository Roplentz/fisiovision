export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseFrame {
  timestampMs: number;
  landmarks: readonly Landmark[];
}

export type View = "frontal" | "lateral" | "posterior" | "oblique";

export type RejectionCode =
  | "invalid_frame"
  | "low_visibility"
  | "insufficient_landmarks"
  | "incomplete_body"
  | "invalid_timestamps"
  | "protocol_not_supported";

export interface RejectionReason {
  code: RejectionCode;
  message: string;
  frameIndex?: number;
  details?: Record<string, number | string | boolean>;
}

export interface QualityRequirements {
  requiredLandmarkIndexes: readonly number[];
  minimumVisibility: number;
  minimumValidFrameRate: number;
  minimumFrames: number;
}

export interface QualityReport {
  accepted: boolean;
  totalFrames: number;
  validFrames: number;
  validFrameRate: number;
  meanVisibility: number;
  reasons: RejectionReason[];
}

export interface MetricValue {
  id: string;
  value: number;
  unit: string;
  confidence: number;
}

export interface EngineResult {
  schemaVersion: "fisiovision-engine-v0.1";
  protocolId: string;
  protocolVersion: string;
  status: "accepted" | "rejected";
  quality: QualityReport;
  metrics: MetricValue[];
  confidence: number;
  reasons: RejectionReason[];
  generatedAt: string;
  disclaimer: string;
}
