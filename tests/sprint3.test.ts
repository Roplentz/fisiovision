import { describe, expect, it } from "vitest";
import {
  analyzeMediaPipe,
  evaluateBenchmark,
  mediaPipeSequenceToFrames,
  mediaPipeToPoseFrame,
  type MediaPipeNormalizedLandmark,
  type MediaPipePoseResult,
} from "../src/index.js";

function landmarks(hipY = 0.4, bend = 0): MediaPipeNormalizedLandmark[] {
  const points = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.99 }));
  points[11] = { x: 0.4, y: hipY - 0.3, visibility: 0.99 };
  points[12] = { x: 0.6, y: hipY - 0.3, visibility: 0.99 };
  points[23] = { x: 0.43, y: hipY, visibility: 0.99 };
  points[24] = { x: 0.57, y: hipY, visibility: 0.99 };
  points[25] = { x: 0.43 + bend, y: hipY + 0.2, visibility: 0.99 };
  points[26] = { x: 0.57 - bend, y: hipY + 0.2, visibility: 0.99 };
  points[27] = { x: 0.43, y: hipY + 0.4, visibility: 0.99 };
  points[28] = { x: 0.57, y: hipY + 0.4, visibility: 0.99 };
  return points;
}

describe("MediaPipe adapter", () => {
  it("accepts Tasks Vision landmarks and microsecond timestamps", () => {
    const frame = mediaPipeToPoseFrame({ timestamp: 1_500_000, landmarks: landmarks() }, 0, { timestampUnit: "us" });
    expect(frame.timestampMs).toBe(1500);
    expect(frame.landmarks).toHaveLength(33);
  });

  it("supports legacy poseLandmarks and mirroring", () => {
    const frame = mediaPipeToPoseFrame({ poseLandmarks: landmarks() }, 100, { mirrorX: true });
    expect(frame.landmarks[11]?.x).toBeCloseTo(0.6);
  });

  it("rejects malformed landmark arrays", () => {
    expect(() => mediaPipeToPoseFrame({ landmarks: [] }, 0)).toThrow(/33 landmarks/);
  });

  it("generates timestamps from fps", () => {
    const frames = mediaPipeSequenceToFrames([{ landmarks: landmarks() }, { landmarks: landmarks() }], 25);
    expect(frames[1]?.timestampMs).toBe(40);
  });
});

describe("end-to-end MediaPipe pipeline", () => {
  it("detects a synthetic squat and benchmarks it", () => {
    const ys = [0.4, 0.41, 0.43, 0.47, 0.51, 0.54, 0.51, 0.47, 0.43, 0.41, 0.4];
    const results: MediaPipePoseResult[] = ys.map((y, index) => ({
      timestampMs: index * 100,
      landmarks: landmarks(y, index > 1 && index < 9 ? 0.08 : 0),
    }));
    const output = analyzeMediaPipe({ protocolId: "squat", results });
    expect(output.status).toBe("accepted");
    const report = evaluateBenchmark([{ id: "synthetic-squat-01", expectedStatus: "accepted", expectedRepetitions: 1, result: output }]);
    expect(report.statusAccuracy).toBe(1);
    expect(report.repetitionMae).toBe(0);
  });
});
