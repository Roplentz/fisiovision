import { describe, expect, it } from "vitest";
import { landmarkToCanvas, nearestFrame, type PoseFrame } from "../src/index.js";

const frames: PoseFrame[] = [0, 100, 200].map((timestampMs) => ({ timestampMs, landmarks: [] }));

describe("reviewer timeline", () => {
  it("selects the nearest pose frame", () => {
    expect(nearestFrame(frames, 149)?.timestampMs).toBe(100);
    expect(nearestFrame(frames, 151)?.timestampMs).toBe(200);
  });
  it("maps normalized landmarks to canvas coordinates", () => {
    expect(landmarkToCanvas(0.5, 0.25, 1280, 720, 0.9)).toEqual({ x: 640, y: 180, visible: true });
  });
  it("hides low-confidence landmarks", () => {
    expect(landmarkToCanvas(0.5, 0.5, 100, 100, 0.2).visible).toBe(false);
  });
});
