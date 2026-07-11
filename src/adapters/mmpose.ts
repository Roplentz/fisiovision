import type { Landmark, PoseFrame } from "../types.js";

export interface MMPoseInstance {
  keypoints: number[][];
  keypoint_scores?: number[];
}

export interface MMPoseFrame {
  timestampMs: number;
  instances: MMPoseInstance[];
  imageWidth?: number;
  imageHeight?: number;
}

export function mmposeToPoseFrame(input: MMPoseFrame, personIndex = 0): PoseFrame {
  const instance = input.instances[personIndex];
  if (!instance) throw new Error(`MMPose person index not found: ${personIndex}`);
  if (instance.keypoints.length !== 17) throw new Error("MMPose COCO adapter requires 17 keypoints");
  const normalized = input.imageWidth !== undefined && input.imageHeight !== undefined;
  if (normalized && (input.imageWidth! <= 0 || input.imageHeight! <= 0)) throw new Error("image dimensions must be positive");
  const landmarks: Landmark[] = instance.keypoints.map((point, index) => {
    if (point.length < 2 || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      throw new Error(`invalid MMPose keypoint: ${index}`);
    }
    const landmark: Landmark = {
      x: normalized ? point[0]! / input.imageWidth! : point[0]!,
      y: normalized ? point[1]! / input.imageHeight! : point[1]!,
    };
    if (point[2] !== undefined && Number.isFinite(point[2])) landmark.z = point[2];
    const score = instance.keypoint_scores?.[index];
    if (score !== undefined) landmark.visibility = Math.max(0, Math.min(1, score));
    return landmark;
  });
  return { timestampMs: input.timestampMs, landmarks };
}
