import type { Landmark, PoseFrame } from "../types.js";

export interface MediaPipeNormalizedLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export interface MediaPipePoseResult {
  timestampMs?: number;
  timestamp?: number;
  landmarks?: readonly MediaPipeNormalizedLandmark[];
  poseLandmarks?: readonly MediaPipeNormalizedLandmark[];
}

export interface MediaPipeAdapterOptions {
  timestampUnit?: "ms" | "us";
  mirrorX?: boolean;
  clampCoordinates?: boolean;
}

const MEDIAPIPE_POSE_LANDMARK_COUNT = 33;

export function mediaPipeToPoseFrame(
  input: MediaPipePoseResult,
  fallbackTimestampMs: number,
  options: MediaPipeAdapterOptions = {},
): PoseFrame {
  const source = input.landmarks ?? input.poseLandmarks;
  if (!source || source.length !== MEDIAPIPE_POSE_LANDMARK_COUNT) {
    throw new Error(`MediaPipe Pose requires exactly ${MEDIAPIPE_POSE_LANDMARK_COUNT} landmarks`);
  }
  const rawTimestamp = input.timestampMs ?? input.timestamp ?? fallbackTimestampMs;
  const timestampMs = options.timestampUnit === "us" && input.timestampMs === undefined
    ? rawTimestamp / 1000
    : rawTimestamp;
  if (!Number.isFinite(timestampMs)) throw new Error("MediaPipe timestamp must be finite");

  const landmarks: Landmark[] = source.map((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new Error(`Invalid MediaPipe landmark at index ${index}`);
    }
    let x = options.mirrorX ? 1 - point.x : point.x;
    let y = point.y;
    if (options.clampCoordinates) {
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));
    }
    const landmark: Landmark = { x, y };
    if (point.z !== undefined && Number.isFinite(point.z)) landmark.z = point.z;
    const confidence = point.visibility ?? point.presence;
    if (confidence !== undefined && Number.isFinite(confidence)) {
      landmark.visibility = Math.max(0, Math.min(1, confidence));
    }
    return landmark;
  });
  return { timestampMs, landmarks };
}

export function mediaPipeSequenceToFrames(
  inputs: readonly MediaPipePoseResult[],
  fps = 30,
  options: MediaPipeAdapterOptions = {},
): PoseFrame[] {
  if (!Number.isFinite(fps) || fps <= 0) throw new Error("fps must be greater than zero");
  return inputs.map((input, index) => mediaPipeToPoseFrame(input, (index * 1000) / fps, options));
}
