import type { Landmark } from "./types.js";

export type CanonicalJoint =
  | "nose" | "left_shoulder" | "right_shoulder" | "left_elbow" | "right_elbow"
  | "left_wrist" | "right_wrist" | "left_hip" | "right_hip" | "left_knee"
  | "right_knee" | "left_ankle" | "right_ankle" | "left_heel" | "right_heel"
  | "left_foot_index" | "right_foot_index";

export type SkeletonFormat = "mediapipe_pose_33" | "coco_17" | "openpose_body_25";

export type CanonicalSkeleton = Partial<Record<CanonicalJoint, Landmark>>;

const MAPS: Record<SkeletonFormat, Partial<Record<CanonicalJoint, number>>> = {
  mediapipe_pose_33: {
    nose: 0, left_shoulder: 11, right_shoulder: 12, left_elbow: 13, right_elbow: 14,
    left_wrist: 15, right_wrist: 16, left_hip: 23, right_hip: 24, left_knee: 25,
    right_knee: 26, left_ankle: 27, right_ankle: 28, left_heel: 29, right_heel: 30,
    left_foot_index: 31, right_foot_index: 32,
  },
  coco_17: {
    nose: 0, left_shoulder: 5, right_shoulder: 6, left_elbow: 7, right_elbow: 8,
    left_wrist: 9, right_wrist: 10, left_hip: 11, right_hip: 12, left_knee: 13,
    right_knee: 14, left_ankle: 15, right_ankle: 16,
  },
  openpose_body_25: {
    nose: 0, right_shoulder: 2, right_elbow: 3, right_wrist: 4, left_shoulder: 5,
    left_elbow: 6, left_wrist: 7, right_hip: 9, right_knee: 10, right_ankle: 11,
    left_hip: 12, left_knee: 13, left_ankle: 14, left_heel: 21, right_heel: 24,
    left_foot_index: 19, right_foot_index: 22,
  },
};

export function toCanonicalSkeleton(
  landmarks: readonly Landmark[],
  format: SkeletonFormat,
): CanonicalSkeleton {
  const output: CanonicalSkeleton = {};
  for (const [joint, index] of Object.entries(MAPS[format]) as Array<[CanonicalJoint, number]>) {
    const landmark = landmarks[index];
    if (landmark && Number.isFinite(landmark.x) && Number.isFinite(landmark.y)) {
      output[joint] = { ...landmark };
    }
  }
  return output;
}

export function requiredCanonicalJoints(
  skeleton: CanonicalSkeleton,
  joints: readonly CanonicalJoint[],
): { complete: boolean; missing: CanonicalJoint[] } {
  const missing = joints.filter((joint) => !skeleton[joint]);
  return { complete: missing.length === 0, missing };
}
