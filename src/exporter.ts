import type { MediaPipePoseResult } from "./adapters/mediapipe.js";
import type { LandmarkArtifact } from "./dataset.js";

export interface LandmarkExportOptions {
  sourceId: string;
  fps: number;
  extractorVersion: string;
  model: string;
}

export function createLandmarkArtifact(
  frames: readonly MediaPipePoseResult[],
  options: LandmarkExportOptions,
): LandmarkArtifact {
  if (!options.sourceId.trim()) throw new Error("sourceId is required");
  if (!Number.isFinite(options.fps) || options.fps <= 0) throw new Error("fps must be greater than zero");
  if (frames.length === 0) throw new Error("at least one frame is required");
  return {
    schemaVersion: "fisiovision-landmarks-v0.1",
    sourceId: options.sourceId,
    fps: options.fps,
    frames: [...frames],
    extractor: {
      name: "MediaPipe Pose",
      version: options.extractorVersion,
      model: options.model,
    },
  };
}
