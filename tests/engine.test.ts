import { describe, expect, it } from "vitest";
import {
  assessQuality,
  exponentialMovingAverage,
  interpolateShortGaps,
  runProtocol,
  type Landmark,
  type PoseFrame,
} from "../src/index.js";

function frame(timestampMs: number, visibility = 0.9): PoseFrame {
  const landmarks: Landmark[] = Array.from({ length: 33 }, (_, index) => ({
    x: 0.3 + index * 0.001,
    y: 0.4 + index * 0.001,
    visibility,
  }));
  return { timestampMs, landmarks };
}

const requirements = {
  requiredLandmarkIndexes: [11, 12, 23, 24, 25, 26, 27, 28],
  minimumVisibility: 0.5,
  minimumValidFrameRate: 0.7,
  minimumFrames: 5,
} as const;

describe("quality gate", () => {
  it("accepts an ordered high-visibility sequence", () => {
    const report = assessQuality(Array.from({ length: 10 }, (_, i) => frame(i * 100)), requirements);
    expect(report.accepted).toBe(true);
    expect(report.validFrameRate).toBe(1);
  });

  it("rejects low visibility", () => {
    const report = assessQuality(Array.from({ length: 10 }, (_, i) => frame(i * 100, 0.2)), requirements);
    expect(report.accepted).toBe(false);
    expect(report.reasons.some((reason) => reason.code === "low_visibility")).toBe(true);
  });

  it("rejects timestamps out of order", () => {
    const report = assessQuality([frame(0), frame(100), frame(50), frame(200), frame(300)], requirements);
    expect(report.accepted).toBe(false);
    expect(report.reasons.some((reason) => reason.code === "invalid_timestamps")).toBe(true);
  });
});

describe("signal processing", () => {
  it("smooths without changing sequence length", () => {
    const output = exponentialMovingAverage([0, 10, 0, 10, 0], 0.5);
    expect(output).toHaveLength(5);
    expect(output.every(Number.isFinite)).toBe(true);
  });

  it("interpolates only short internal gaps", () => {
    expect(interpolateShortGaps([0, null, null, 3], 2)).toEqual([0, 1, 2, 3]);
  });
});

describe("protocol runner", () => {
  it("returns a versioned finite result", () => {
    const result = runProtocol(
      Array.from({ length: 10 }, (_, i) => frame(i * 100)),
      { id: "squat", version: "0.1.0", quality: requirements },
      new Date("2026-07-11T00:00:00.000Z"),
    );
    expect(result.status).toBe("accepted");
    expect(result.schemaVersion).toBe("fisiovision-engine-v0.1");
    expect(Number.isFinite(result.confidence)).toBe(true);
    expect(result.disclaimer).toContain("confirmação profissional");
  });
});
