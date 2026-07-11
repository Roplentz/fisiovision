import type { MediaPipePoseResult } from "./adapters/mediapipe.js";
import { createLandmarkArtifact, type LandmarkExportOptions } from "./exporter.js";
import type { GroundTruthDraft } from "./review.js";
import { approveGroundTruth } from "./review.js";
import {
  createValidationPackage,
  serializeValidationPackage,
  type PackageDatasetMetadata,
  type ValidationPackage,
} from "./validation-package.js";

export interface LocalVideoReference {
  name: string;
  sizeBytes: number;
  type: string;
  lastModifiedMs?: number;
}

export interface LocalExtractionRequest {
  video: LocalVideoReference;
  extract: () => Promise<readonly MediaPipePoseResult[]>;
  exportOptions: LandmarkExportOptions;
  groundTruth: Omit<GroundTruthDraft, "decision" | "reviewedAt">;
  reviewerId: string;
}

export interface LocalToolResult {
  bundle: ValidationPackage;
  files: Record<string, string>;
}

export async function buildLocalValidationPackage(
  metadata: PackageDatasetMetadata,
  requests: readonly LocalExtractionRequest[],
  now = new Date(),
): Promise<LocalToolResult> {
  if (requests.length === 0) throw new Error("select at least one local video");
  const reviewed = [];
  for (const request of requests) {
    assertLocalVideo(request.video);
    const frames = await request.extract();
    const artifact = createLandmarkArtifact(frames, request.exportOptions);
    const review = approveGroundTruth(request.groundTruth, request.reviewerId, now);
    reviewed.push({ artifact, review, tags: [request.video.type || "unknown-media-type"] });
  }
  const bundle = createValidationPackage(metadata, reviewed, now);
  return { bundle, files: serializeValidationPackage(bundle) };
}

function assertLocalVideo(video: LocalVideoReference): void {
  if (!video.name.trim()) throw new Error("video name is required");
  if (!Number.isFinite(video.sizeBytes) || video.sizeBytes <= 0) throw new Error("video must not be empty");
  if (video.type && !video.type.startsWith("video/")) throw new Error("selected file must be a video");
}
