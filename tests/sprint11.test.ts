import { describe, expect, it } from "vitest";
import { ReleaseRegistry, compareReleases, evaluatePromotion, type AggregateValidationReport, type EngineRelease, type PromotionPolicy } from "../src/index.js";

function release(id: string, overrides: Partial<AggregateValidationReport> = {}): EngineRelease {
  return {
    id, engineVersion: "0.11.0", protocolId: "squat", protocolVersion: "0.1.0",
    modelName: "pose-landmarker-lite", modelVersion: "1", modelChecksum: "sha256:abc",
    createdAt: "2026-07-11T00:00:00.000Z", status: "candidate",
    validation: {
      schemaVersion: "fisiovision-aggregate-v0.1", samples: 100,
      matrix: { trueAccepted: 45, trueRejected: 45, falseAccepted: 5, falseRejected: 5 },
      accuracy: 0.9, sensitivity: 0.9, specificity: 0.9, repetitionMae: 0.3,
      rejectionRate: 0.5, statusMismatches: [], countMismatches: [], ...overrides,
    },
  };
}
const policy: PromotionPolicy = {
  minimumSamples: 50, minimumAccuracy: 0.85, minimumSensitivity: 0.85,
  minimumSpecificity: 0.85, maximumRepetitionMae: 0.5, maximumRejectionRate: 0.6,
  requireNoStatusRegression: true,
};

describe("release governance", () => {
  it("approves a release that meets policy", () => {
    const candidate = release("candidate");
    const decision = evaluatePromotion(candidate, policy);
    expect(decision.eligible).toBe(true);
    const registry = new ReleaseRegistry();
    registry.register(candidate);
    expect(registry.promote(candidate.id, decision).status).toBe("approved");
  });
  it("blocks a release below thresholds", () => {
    const candidate = release("weak", { accuracy: 0.7, repetitionMae: 1 });
    const decision = evaluatePromotion(candidate, policy);
    expect(decision.eligible).toBe(false);
    expect(decision.reasons.some((reason) => reason.startsWith("Acurácia"))).toBe(true);
  });
  it("detects regressions against baseline", () => {
    const comparison = compareReleases(release("base"), release("next", { sensitivity: 0.8, rejectionRate: 0.6 }));
    expect(comparison.regressions).toContain("sensibilidade diminuiu");
    expect(comparison.regressions).toContain("taxa de rejeição aumentou");
  });
});
