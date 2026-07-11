import { describe, expect, it } from "vitest";
import { engineResultToViewModel, type EngineResult } from "../src/index.js";

const result: EngineResult = {
  schemaVersion: "fisiovision-engine-v0.1",
  protocolId: "squat",
  protocolVersion: "0.1.0",
  status: "accepted",
  quality: { accepted: true, totalFrames: 10, validFrames: 9, validFrameRate: 0.9, meanVisibility: 0.8, reasons: [] },
  metrics: [{ id: "knee_flexion_range_left", value: 42.123, unit: "deg", confidence: 0.8 }],
  confidence: 0.812,
  reasons: [],
  generatedAt: "2026-07-11T00:00:00.000Z",
  disclaimer: "Requer confirmação profissional.",
};

describe("result presentation", () => {
  it("formats confidence, clinical labels and units", () => {
    const view = engineResultToViewModel(result);
    expect(view.statusLabel).toBe("Análise aceita");
    expect(view.confidencePercent).toBe(81);
    expect(view.metrics[0]?.label).toBe("Amplitude do joelho esquerdo");
    expect(view.metrics[0]?.formattedValue).toBe("42.1°");
  });
});
