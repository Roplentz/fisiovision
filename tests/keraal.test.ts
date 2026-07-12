import { describe, expect, it } from "vitest";
import { keraalBlazePoseToFrames } from "../src/index.js";

describe("Keraal public dataset adapter", () => {
  it("converts named BlazePose frames", () => {
    const frames = keraalBlazePoseToFrames({
      "0": { Left_shoulder: [48, 36, .1], Right_shoulder: [52, 36, .1] },
      "1": { Left_shoulder: [49, 36, .1], Right_shoulder: [53, 36, .1] },
    }, 25, { width: 100, height: 100 });
    expect(frames).toHaveLength(2);
    expect(frames[1]?.timestampMs).toBe(40);
    expect(frames[0]?.landmarks[11]).toMatchObject({ x: .48, y: .36, z: .1 });
    expect(frames[0]?.landmarks[25]?.visibility).toBe(0);
  });
});
