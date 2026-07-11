import type { SupportedProtocolId } from "./pipeline.js";

export type ReviewDecision = "pending" | "approved" | "rejected";

export interface GroundTruthDraft {
  sampleId: string;
  protocolId: SupportedProtocolId;
  expectedStatus: "accepted" | "rejected";
  expectedRepetitions?: number;
  split: "development" | "validation" | "test";
  reviewerId?: string;
  notes?: string;
  decision: ReviewDecision;
  reviewedAt?: string;
}

export interface GroundTruthValidation {
  valid: boolean;
  errors: string[];
}

export function validateGroundTruth(review: GroundTruthDraft): GroundTruthValidation {
  const errors: string[] = [];
  if (!review.sampleId.trim()) errors.push("sampleId is required");
  if (review.expectedStatus === "accepted" && review.expectedRepetitions === undefined) {
    errors.push("accepted samples require expectedRepetitions");
  }
  if (review.expectedRepetitions !== undefined && (!Number.isInteger(review.expectedRepetitions) || review.expectedRepetitions < 0)) {
    errors.push("expectedRepetitions must be a non-negative integer");
  }
  if (review.decision === "approved" && !review.reviewerId?.trim()) errors.push("approved reviews require reviewerId");
  if (review.decision === "approved" && !review.reviewedAt) errors.push("approved reviews require reviewedAt");
  return { valid: errors.length === 0, errors };
}

export function approveGroundTruth(
  draft: Omit<GroundTruthDraft, "decision" | "reviewedAt">,
  reviewerId: string,
  now = new Date(),
): GroundTruthDraft {
  const approved: GroundTruthDraft = {
    ...draft,
    reviewerId,
    decision: "approved",
    reviewedAt: now.toISOString(),
  };
  const validation = validateGroundTruth(approved);
  if (!validation.valid) throw new Error(`Invalid ground truth: ${validation.errors.join("; ")}`);
  return approved;
}
