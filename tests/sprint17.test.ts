import { describe, expect, it } from "vitest";
import {
  butterworthLowPass, compareMeasurements, evaluateSegmentConsistency, metricEvidence,
  mmposeToPoseFrame, requiredCanonicalJoints, toCanonicalSkeleton, type Landmark,
} from "../src/index.js";

describe("universal skeleton", () => {
  it("maps COCO joints to canonical names", () => {
    const points: Landmark[] = Array.from({ length: 17 }, (_, i) => ({ x: i, y: i, visibility: .9 }));
    const skeleton = toCanonicalSkeleton(points, "coco_17");
    expect(skeleton.left_hip?.x).toBe(11);
    expect(requiredCanonicalJoints(skeleton, ["left_hip", "left_heel"]).missing).toEqual(["left_heel"]);
  });
  it("normalizes MMPose pixels", () => {
    const frame = mmposeToPoseFrame({ timestampMs: 10, imageWidth: 100, imageHeight: 200, instances: [{ keypoints: Array.from({ length: 17 }, () => [50, 100]), keypoint_scores: Array(17).fill(.8) }] });
    expect(frame.landmarks[0]).toMatchObject({ x: .5, y: .5, visibility: .8 });
  });
});

describe("biomechanical signal quality", () => {
  it("attenuates high frequency noise with Butterworth", () => {
    const noisy = Array.from({ length: 60 }, (_, i) => Math.sin(i / 10) + (i % 2 ? .4 : -.4));
    const filtered = butterworthLowPass(noisy, { samplingHz: 30, cutoffHz: 4 });
    const roughness = (v: number[]) => v.slice(1).reduce((sum, x, i) => sum + Math.abs(x - v[i]!), 0);
    expect(roughness(filtered)).toBeLessThan(roughness(noisy));
  });
  it("detects unstable segment lengths", () => {
    const frames = [.2, .2, .35].map((length) => ({ left_hip: { x: 0, y: 0 }, left_knee: { x: 0, y: length } }));
    expect(evaluateSegmentConsistency(frames, [{ id: "left_thigh", proximal: "left_hip", distal: "left_knee" }])[0]?.accepted).toBe(false);
  });
  it("produces per-metric uncertainty", () => {
    expect(metricEvidence({ metricId: "knee", validFrameRate: .8, meanLandmarkVisibility: .9, temporalStability: .7, viewSuitability: .6, limitations: ["2D"] }).uncertainty).toBeCloseTo(.255);
  });
  it("calculates paired agreement", () => {
    const report = compareMeasurements([10, 20, 30], [11, 19, 32]);
    expect(report.meanAbsoluteError).toBeCloseTo(4/3);
    expect(report.bias).toBeCloseTo(2/3);
  });
});
