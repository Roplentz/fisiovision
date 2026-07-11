import { describe, expect, it } from "vitest";
import {
  benchmarkDataset,
  benchmarkReportToCsv,
  benchmarkReportToMarkdown,
  createLandmarkArtifact,
  validateDatasetManifest,
  type DatasetManifest,
  type MediaPipeNormalizedLandmark,
} from "../src/index.js";

function landmarks(hipY = 0.4, bend = 0): MediaPipeNormalizedLandmark[] {
  const points = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.99 }));
  points[11] = { x: 0.4, y: hipY - 0.3, visibility: 0.99 };
  points[12] = { x: 0.6, y: hipY - 0.3, visibility: 0.99 };
  points[23] = { x: 0.43, y: hipY, visibility: 0.99 };
  points[24] = { x: 0.57, y: hipY, visibility: 0.99 };
  points[25] = { x: 0.43 + bend, y: hipY + 0.2, visibility: 0.99 };
  points[26] = { x: 0.57 - bend, y: hipY + 0.2, visibility: 0.99 };
  points[27] = { x: 0.43, y: hipY + 0.4, visibility: 0.99 };
  points[28] = { x: 0.57, y: hipY + 0.4, visibility: 0.99 };
  return points;
}

const manifest: DatasetManifest = {
  schemaVersion: "fisiovision-dataset-v0.1",
  id: "authorized-squat",
  version: "0.1.0",
  title: "Authorized squat",
  source: "internal-consented",
  license: "proprietary-consented",
  consentOrLegalBasis: "consent-record-001",
  containsIdentifiableMedia: false,
  createdAt: "2026-07-11T00:00:00.000Z",
  samples: [{
    id: "sample-001",
    landmarksFile: "landmarks/sample-001.json",
    protocolId: "squat",
    expectedStatus: "accepted",
    expectedRepetitions: 1,
    split: "validation",
  }],
};

describe("dataset governance", () => {
  it("validates a safe, pseudonymized manifest", () => {
    expect(validateDatasetManifest(manifest)).toEqual({ valid: true, errors: [] });
  });
  it("rejects identifiable media and unsafe paths", () => {
    const invalid = structuredClone(manifest);
    invalid.containsIdentifiableMedia = true;
    invalid.samples[0]!.landmarksFile = "../video.mp4";
    const result = validateDatasetManifest(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("batch benchmark and reports", () => {
  it("runs a manifest and renders Markdown and CSV", async () => {
    const ys = [0.4, 0.41, 0.43, 0.47, 0.51, 0.54, 0.51, 0.47, 0.43, 0.41, 0.4];
    const artifact = createLandmarkArtifact(
      ys.map((y, index) => ({ timestampMs: index * 100, landmarks: landmarks(y, index > 1 && index < 9 ? 0.08 : 0) })),
      { sourceId: "sample-001", fps: 10, extractorVersion: "0.10", model: "pose-landmarker" },
    );
    const report = await benchmarkDataset(manifest, async () => artifact);
    expect(report.statusAccuracy).toBe(1);
    expect(report.repetitionMae).toBe(0);
    expect(benchmarkReportToMarkdown(report, manifest.id, manifest.version)).toContain("100.0%");
    expect(benchmarkReportToCsv(report)).toContain("status_accuracy,1");
  });
});
