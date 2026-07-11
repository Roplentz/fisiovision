import type { QualityRequirements, View } from "./types.js";

export interface ProtocolMetricDefinition {
  id: string;
  unit: string;
  description: string;
}

export interface ClinicalProtocol {
  id: string;
  version: string;
  name: string;
  purpose: string;
  required_views: View[];
  quality: {
    minimum_valid_frame_rate: number;
    minimum_visibility: number;
    full_body_required: boolean;
  };
  phases: string[];
  metrics: ProtocolMetricDefinition[];
  status: "research" | "validated" | "deprecated";
}

export interface ProtocolValidation {
  valid: boolean;
  errors: string[];
}

export function validateProtocol(value: unknown): ProtocolValidation {
  const errors: string[] = [];
  if (!value || typeof value !== "object") return { valid: false, errors: ["protocol must be an object"] };
  const p = value as Record<string, unknown>;
  for (const key of ["id", "version", "name", "purpose"]) {
    if (typeof p[key] !== "string" || !(p[key] as string).trim()) errors.push(`${key} must be a non-empty string`);
  }
  if (!Array.isArray(p.required_views) || p.required_views.length === 0) errors.push("required_views must not be empty");
  if (!Array.isArray(p.phases) || p.phases.length < 2) errors.push("phases must contain at least two phases");
  if (!Array.isArray(p.metrics)) errors.push("metrics must be an array");
  const quality = p.quality as Record<string, unknown> | undefined;
  if (!quality || typeof quality !== "object") errors.push("quality must be an object");
  else {
    for (const key of ["minimum_valid_frame_rate", "minimum_visibility"]) {
      const n = quality[key];
      if (typeof n !== "number" || n < 0 || n > 1) errors.push(`quality.${key} must be between 0 and 1`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function qualityRequirements(
  protocol: ClinicalProtocol,
  requiredLandmarkIndexes: readonly number[],
  minimumFrames = 10,
): QualityRequirements {
  return {
    requiredLandmarkIndexes,
    minimumVisibility: protocol.quality.minimum_visibility,
    minimumValidFrameRate: protocol.quality.minimum_valid_frame_rate,
    minimumFrames,
  };
}
