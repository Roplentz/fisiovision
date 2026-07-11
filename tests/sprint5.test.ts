import { describe, expect, it } from "vitest";
import {
  approveGroundTruth,
  buildLocalValidationPackage,
  createLandmarkArtifact,
  createValidationPackage,
  serializeValidationPackage,
  validateGroundTruth,
  type MediaPipeNormalizedLandmark,
} from "../src/index.js";

function landmarks(): MediaPipeNormalizedLandmark[] {
  return Array.from({ length: 33 }, (_, index) => ({
    x: 0.3 + index * 0.005,
    y: 0.4 + index * 0.005,
    visibility: 0.99,
  }));
}

const draft = {
  sampleId: "sample-001",
  protocolId: "squat" as const,
  expectedStatus: "accepted" as const,
  expectedRepetitions: 1,
  split: "validation" as const,
};

const metadata = {
  id: "local-authorized",
  version: "0.1.0",
  title: "Local authorized validation",
  source: "local-consented",
  license: "proprietary-consented" as const,
  consentOrLegalBasis: "consent-001",
};

describe("ground truth review", () => {
  it("requires reviewer traceability", () => {
    expect(validateGroundTruth({ ...draft, decision: "approved" }).valid).toBe(false);
  });
  it("approves a complete review", () => {
    const review = approveGroundTruth(draft, "reviewer-001", new Date("2026-07-11T00:00:00Z"));
    expect(review.decision).toBe("approved");
    expect(review.reviewedAt).toBe("2026-07-11T00:00:00.000Z");
  });
});

describe("validation package", () => {
  it("generates manifest and landmark files without video", () => {
    const artifact = createLandmarkArtifact(
      [{ timestampMs: 0, landmarks: landmarks() }],
      { sourceId: "sample-001", fps: 30, extractorVersion: "0.10", model: "pose-landmarker" },
    );
    const review = approveGroundTruth(draft, "reviewer-001");
    const bundle = createValidationPackage(metadata, [{ artifact, review }]);
    const files = serializeValidationPackage(bundle);
    expect(files["manifest.json"]).toContain("sample-001");
    expect(files["landmarks/sample-001.json"]).toBeDefined();
    expect(Object.keys(files).some((path) => path.endsWith(".mp4"))).toBe(false);
  });

  it("orchestrates local extraction and packaging", async () => {
    const output = await buildLocalValidationPackage(metadata, [{
      video: { name: "private.mp4", sizeBytes: 1024, type: "video/mp4" },
      extract: async () => [{ timestampMs: 0, landmarks: landmarks() }],
      exportOptions: { sourceId: "sample-001", fps: 30, extractorVersion: "0.10", model: "pose-landmarker" },
      groundTruth: draft,
      reviewerId: "reviewer-001",
    }]);
    expect(output.bundle.manifest.containsIdentifiableMedia).toBe(false);
    expect(JSON.stringify(output.files)).not.toContain("private.mp4");
  });
});
