export interface MetricEvidence {
  metricId: string;
  confidence: number;
  validFrameRate: number;
  meanLandmarkVisibility: number;
  temporalStability: number;
  viewSuitability: number;
  uncertainty: number;
  limitations: string[];
}

export function metricEvidence(input: Omit<MetricEvidence, "confidence" | "uncertainty">): MetricEvidence {
  const components = [input.validFrameRate, input.meanLandmarkVisibility, input.temporalStability, input.viewSuitability].map(clamp);
  const confidence = components[0]! * .3 + components[1]! * .3 + components[2]! * .25 + components[3]! * .15;
  return { ...input, confidence: round(confidence), uncertainty: round(1 - confidence) };
}
function clamp(value: number): number { return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0 }
function round(value: number): number { return Math.round(value * 1000) / 1000 }
