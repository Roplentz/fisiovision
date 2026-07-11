import { describe, expect, it } from "vitest";
import {
  ProtocolRegistry,
  angleDegrees,
  runSquatProtocol,
  segmentSquats,
  validateProtocol,
  type ClinicalProtocol,
  type Landmark,
  type PoseFrame,
} from "../src/index.js";

describe("kinematics", () => {
  it("calculates a right angle", () => {
    expect(angleDegrees({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(90);
  });
  it("rejects a zero-length vector", () => {
    expect(angleDegrees({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })).toBeNull();
  });
});

describe("protocol registry", () => {
  const protocol: ClinicalProtocol = {
    id: "squat", version: "0.1.0", name: "Agachamento", purpose: "Pesquisa",
    required_views: ["lateral"],
    quality: { minimum_valid_frame_rate: 0.7, minimum_visibility: 0.5, full_body_required: true },
    phases: ["standing", "bottom"], metrics: [], status: "research",
  };
  it("validates and retrieves a protocol", () => {
    expect(validateProtocol(protocol).valid).toBe(true);
    const registry = new ProtocolRegistry();
    registry.register(protocol);
    expect(registry.get("squat")?.version).toBe("0.1.0");
  });
});

describe("squat segmentation", () => {
  it("finds a complete down-up cycle", () => {
    const ys = [0.4, 0.43, 0.49, 0.54, 0.49, 0.43, 0.4];
    const samples = ys.map((hipY, i) => ({ timestampMs: i * 150, hipY, kneeAngle: i === 0 || i === 6 ? 175 : 140 }));
    const reps = segmentSquats(samples);
    expect(reps).toHaveLength(1);
    expect(reps[0]?.bottomIndex).toBe(3);
  });

  it("does not count an incomplete descent", () => {
    expect(segmentSquats([
      { timestampMs: 0, hipY: 0.4, kneeAngle: 175 },
      { timestampMs: 200, hipY: 0.5, kneeAngle: 140 },
      { timestampMs: 400, hipY: 0.55, kneeAngle: 110 },
    ])).toHaveLength(0);
  });
});

function poseFrame(timestampMs: number, hipY: number, kneeBend: number): PoseFrame {
  const landmarks: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.99 }));
  landmarks[11] = { x: 0.4, y: hipY - 0.3, visibility: 0.99 };
  landmarks[12] = { x: 0.6, y: hipY - 0.3, visibility: 0.99 };
  landmarks[23] = { x: 0.43, y: hipY, visibility: 0.99 };
  landmarks[24] = { x: 0.57, y: hipY, visibility: 0.99 };
  landmarks[25] = { x: 0.43 + kneeBend, y: hipY + 0.2, visibility: 0.99 };
  landmarks[26] = { x: 0.57 - kneeBend, y: hipY + 0.2, visibility: 0.99 };
  landmarks[27] = { x: 0.43, y: hipY + 0.4, visibility: 0.99 };
  landmarks[28] = { x: 0.57, y: hipY + 0.4, visibility: 0.99 };
  return { timestampMs, landmarks };
}

describe("squat protocol executor", () => {
  it("produces finite metrics for a synthetic repetition", () => {
    const ys = [0.4, 0.41, 0.43, 0.47, 0.51, 0.54, 0.51, 0.47, 0.43, 0.41, 0.4];
    const frames = ys.map((y, i) => poseFrame(i * 100, y, i > 1 && i < 9 ? 0.08 : 0));
    const output = runSquatProtocol(frames, new Date("2026-07-11T00:00:00Z"));
    expect(output.status).toBe("accepted");
    expect(output.metrics.find((metric) => metric.id === "repetition_count")?.value).toBe(1);
    expect(output.metrics.every((metric) => Number.isFinite(metric.value))).toBe(true);
  });
});
