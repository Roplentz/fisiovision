import type { Landmark, PoseFrame } from "./types.js";

const BLAZEPOSE_NAMES = [
  "Nose","Left_eye_inner","Left_eye","Left_eye_outer","Right_eye_inner","Right_eye","Right_eye_outer",
  "Left_ear","Right_ear","Mouth_left","Mouth_right","Left_shoulder","Right_shoulder","Left_elbow",
  "Right_elbow","Left_wrist","Right_wrist","Left_pinky","Right_pinky","Left_index","Right_index",
  "Left_thumb","Right_thumb","Left_hip","Right_hip","Left_knee","Right_knee","Left_ankle","Right_ankle",
  "Left_heel","Right_heel","Left_foot_index","Right_foot_index",
] as const;

export type KeraalJointDictionary = Record<string, [number, number] | [number, number, number]>;
export type KeraalFrameDictionary = Record<string, KeraalJointDictionary>;

export function keraalBlazePoseToFrames(
  input: KeraalFrameDictionary | { positions: KeraalFrameDictionary },
  fps: number,
  normalize?: { width: number; height: number },
): PoseFrame[] {
  if (!Number.isFinite(fps) || fps <= 0) throw new Error("fps must be greater than zero");
  const dictionary = "positions" in input ? input.positions : input;
  const frames = Object.entries(dictionary).sort(([a], [b]) => Number(a) - Number(b));
  return frames.map(([frameNumber, joints]) => {
    const landmarks: Landmark[] = BLAZEPOSE_NAMES.map((name) => {
      const point = joints[name];
      if (!point) return { x: NaN, y: NaN, visibility: 0 };
      const landmark: Landmark = {
        x: normalize ? point[0] / normalize.width : point[0],
        y: normalize ? point[1] / normalize.height : point[1],
        visibility: 1,
      };
      if (point[2] !== undefined) landmark.z = point[2];
      return landmark;
    });
    return { timestampMs: Number(frameNumber) * 1000 / fps, landmarks };
  });
}
