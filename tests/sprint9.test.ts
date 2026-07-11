import { describe, expect, it } from "vitest";
import { compareResultToGroundTruth, comparisonToMarkdown, type EngineResult } from "../src/index.js";

function result(status: "accepted" | "rejected", repetitions?: number): EngineResult {
  return {
    schemaVersion: "fisiovision-engine-v0.1",
    protocolId: "squat",
    protocolVersion: "0.1.0",
    status,
    quality: { accepted: status === "accepted", totalFrames: 10, validFrames: 10, validFrameRate: 1, meanVisibility: 1, reasons: [] },
    metrics: repetitions === undefined ? [] : [{ id: "repetition_count", value: repetitions, unit: "count", confidence: 1 }],
    confidence: 1,
    reasons: [],
    generatedAt: "2026-07-11T00:00:00.000Z",
    disclaimer: "research",
  };
}

describe("automatic vs ground truth comparison", () => {
  it("reports an exact match", () => {
    const comparison = compareResultToGroundTruth(result("accepted", 2), { expectedStatus: "accepted", expectedRepetitions: 2 });
    expect(comparison.outcome).toBe("match");
    expect(comparison.repetitionAbsoluteError).toBe(0);
  });
  it("prioritizes status mismatch", () => {
    expect(compareResultToGroundTruth(result("rejected"), { expectedStatus: "accepted", expectedRepetitions: 1 }).outcome).toBe("status_mismatch");
  });
  it("renders an auditable Markdown report", () => {
    const markdown = comparisonToMarkdown("sample-001", compareResultToGroundTruth(result("accepted", 3), { expectedStatus: "accepted", expectedRepetitions: 2 }));
    expect(markdown).toContain("Erro absoluto de contagem: 1");
    expect(markdown).toContain("count_mismatch");
  });
});
