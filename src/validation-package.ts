import type { DatasetManifest, DatasetSample, LandmarkArtifact } from "./dataset.js";
import { validateDatasetManifest } from "./dataset.js";
import type { GroundTruthDraft } from "./review.js";
import { validateGroundTruth } from "./review.js";

export interface ValidationPackage {
  schemaVersion: "fisiovision-validation-package-v0.1";
  manifest: DatasetManifest;
  artifacts: Record<string, LandmarkArtifact>;
  generatedAt: string;
}

export interface PackageDatasetMetadata {
  id: string;
  version: string;
  title: string;
  source: string;
  license: DatasetManifest["license"];
  consentOrLegalBasis: string;
}

export interface ReviewedArtifact {
  artifact: LandmarkArtifact;
  review: GroundTruthDraft;
  subjectPseudonym?: string;
  tags?: string[];
}

export function createValidationPackage(
  metadata: PackageDatasetMetadata,
  reviewed: readonly ReviewedArtifact[],
  now = new Date(),
): ValidationPackage {
  if (reviewed.length === 0) throw new Error("at least one reviewed artifact is required");
  const artifacts: Record<string, LandmarkArtifact> = {};
  const samples: DatasetSample[] = reviewed.map(({ artifact, review, subjectPseudonym, tags }) => {
    const reviewValidation = validateGroundTruth(review);
    if (!reviewValidation.valid || review.decision !== "approved") {
      throw new Error(`Ground truth not approved for ${review.sampleId}: ${reviewValidation.errors.join("; ")}`);
    }
    const landmarksFile = `landmarks/${review.sampleId}.json`;
    if (artifacts[landmarksFile]) throw new Error(`Duplicate sampleId: ${review.sampleId}`);
    artifacts[landmarksFile] = artifact;
    return {
      id: review.sampleId,
      landmarksFile,
      protocolId: review.protocolId,
      expectedStatus: review.expectedStatus,
      ...(review.expectedRepetitions === undefined ? {} : { expectedRepetitions: review.expectedRepetitions }),
      split: review.split,
      ...(subjectPseudonym ? { subjectPseudonym } : {}),
      ...(tags ? { tags } : {}),
    };
  });

  const manifest: DatasetManifest = {
    schemaVersion: "fisiovision-dataset-v0.1",
    ...metadata,
    containsIdentifiableMedia: false,
    createdAt: now.toISOString(),
    samples,
  };
  const validation = validateDatasetManifest(manifest);
  if (!validation.valid) throw new Error(`Invalid generated manifest: ${validation.errors.join("; ")}`);
  return {
    schemaVersion: "fisiovision-validation-package-v0.1",
    manifest,
    artifacts,
    generatedAt: now.toISOString(),
  };
}

export function serializeValidationPackage(bundle: ValidationPackage): Record<string, string> {
  const files: Record<string, string> = {
    "manifest.json": JSON.stringify(bundle.manifest, null, 2) + "\n",
    "package.json": JSON.stringify({
      schemaVersion: bundle.schemaVersion,
      generatedAt: bundle.generatedAt,
      artifactCount: Object.keys(bundle.artifacts).length,
    }, null, 2) + "\n",
  };
  for (const [path, artifact] of Object.entries(bundle.artifacts)) {
    files[path] = JSON.stringify(artifact, null, 2) + "\n";
  }
  return files;
}
