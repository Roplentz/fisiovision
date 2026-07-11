import type { MediaPipePoseResult } from "./adapters/mediapipe.js";
import { analyzeMediaPipe, type SupportedProtocolId } from "./pipeline.js";
import { evaluateBenchmark, type BenchmarkCase, type BenchmarkReport } from "./validation.js";

export type DatasetLicense = "CC0-1.0" | "CC-BY-4.0" | "CC-BY-SA-4.0" | "proprietary-consented" | "research-agreement";

export interface DatasetSample {
  id: string;
  landmarksFile: string;
  protocolId: SupportedProtocolId;
  expectedStatus: "accepted" | "rejected";
  expectedRepetitions?: number;
  split: "development" | "validation" | "test";
  subjectPseudonym?: string;
  tags?: string[];
}

export interface DatasetManifest {
  schemaVersion: "fisiovision-dataset-v0.1";
  id: string;
  version: string;
  title: string;
  source: string;
  license: DatasetLicense;
  consentOrLegalBasis: string;
  containsIdentifiableMedia: boolean;
  createdAt: string;
  samples: DatasetSample[];
}

export interface LandmarkArtifact {
  schemaVersion: "fisiovision-landmarks-v0.1";
  sourceId: string;
  fps: number;
  frames: MediaPipePoseResult[];
  extractor: {
    name: "MediaPipe Pose";
    version: string;
    model: string;
  };
}

export interface ManifestValidation {
  valid: boolean;
  errors: string[];
}

export function validateDatasetManifest(value: unknown): ManifestValidation {
  const errors: string[] = [];
  if (!value || typeof value !== "object") return { valid: false, errors: ["manifest must be an object"] };
  const manifest = value as Partial<DatasetManifest>;
  if (manifest.schemaVersion !== "fisiovision-dataset-v0.1") errors.push("unsupported schemaVersion");
  for (const key of ["id", "version", "title", "source", "consentOrLegalBasis", "createdAt"] as const) {
    if (typeof manifest[key] !== "string" || !manifest[key]?.trim()) errors.push(`${key} must be a non-empty string`);
  }
  if (!manifest.license) errors.push("license is required");
  if (manifest.containsIdentifiableMedia === true) errors.push("identifiable media must remain outside the repository");
  if (!Array.isArray(manifest.samples) || manifest.samples.length === 0) errors.push("samples must not be empty");
  else {
    const ids = new Set<string>();
    manifest.samples.forEach((sample, index) => {
      if (!sample.id || ids.has(sample.id)) errors.push(`samples[${index}].id must be unique`);
      ids.add(sample.id);
      if (!sample.landmarksFile?.endsWith(".json")) errors.push(`samples[${index}].landmarksFile must reference JSON`);
      if (sample.landmarksFile?.includes("..") || sample.landmarksFile?.startsWith("/")) {
        errors.push(`samples[${index}].landmarksFile must be a safe relative path`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

export async function benchmarkDataset(
  manifest: DatasetManifest,
  loadArtifact: (relativePath: string) => Promise<LandmarkArtifact>,
  split: DatasetSample["split"] = "validation",
): Promise<BenchmarkReport> {
  const validation = validateDatasetManifest(manifest);
  if (!validation.valid) throw new Error(`Invalid dataset manifest: ${validation.errors.join("; ")}`);
  const cases: BenchmarkCase[] = [];
  for (const sample of manifest.samples.filter((item) => item.split === split)) {
    const artifact = await loadArtifact(sample.landmarksFile);
    if (artifact.schemaVersion !== "fisiovision-landmarks-v0.1") throw new Error(`Unsupported artifact: ${sample.id}`);
    const result = analyzeMediaPipe({ protocolId: sample.protocolId, results: artifact.frames, fps: artifact.fps });
    cases.push({
      id: sample.id,
      expectedStatus: sample.expectedStatus,
      ...(sample.expectedRepetitions === undefined ? {} : { expectedRepetitions: sample.expectedRepetitions }),
      result,
    });
  }
  return evaluateBenchmark(cases);
}
