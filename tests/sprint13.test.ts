import { describe, expect, it } from "vitest";
import { createConsumerDeployment, loadConsumerRelease, type AggregateValidationReport, type ConsumerReleaseConfig, type EngineRelease } from "../src/index.js";

const validation: AggregateValidationReport = { schemaVersion: "fisiovision-aggregate-v0.1", samples: 100, matrix: { trueAccepted: 45, trueRejected: 45, falseAccepted: 5, falseRejected: 5 }, accuracy: .9, sensitivity: .9, specificity: .9, repetitionMae: .2, rejectionRate: .5, statusMismatches: [], countMismatches: [] };
function release(id: string, status: EngineRelease["status"] = "approved"): EngineRelease {
  return { id, engineVersion: id, protocolId: "squat", protocolVersion: "0.1.0", modelName: "pose", modelVersion: id, modelChecksum: "sha256:"+id.padEnd(64,"0"), createdAt: "2026-07-11T00:00:00Z", status, validation };
}
const config = (id: string): ConsumerReleaseConfig => ({ schemaVersion: "fisiovision-consumer-config-v0.1", consumerId: "pilatesvision", activeReleaseId: id, engineVersion: id, protocolId: "squat", protocolVersion: "0.1.0", modelName: "pose", modelVersion: id, modelChecksum: "sha256:"+id.padEnd(64,"0"), activatedAt: "2026-07-11T00:00:00Z" });

describe("consumer integration", () => {
  it("serves only an approved primary with approved fallback", async () => {
    const manifest = await createConsumerDeployment({ consumerId: "pilatesvision", releaseId: "v2" }, {
      getApprovedRelease: async () => release("v2"),
      getFallbackRelease: async () => release("v1"),
    }, new Date("2026-07-11T00:00:00Z"));
    expect(manifest.primary.activeReleaseId).toBe("v2");
    expect(manifest.fallback?.activeReleaseId).toBe("v1");
  });
  it("falls back when primary checksum fails", async () => {
    const manifest = { schemaVersion: "fisiovision-consumer-deployment-v0.1" as const, consumerId: "pilatesvision", primary: config("v2"), fallback: config("v1"), issuedAt: "2026-07-11T00:00:00Z", expiresAt: "2026-07-11T01:00:00Z" };
    const loaded = await loadConsumerRelease(manifest, "pilatesvision", async (item) => ({ artifact: item.activeReleaseId, bytes: new Uint8Array([1]) }), async (_bytes, checksum) => checksum.includes("v1"), new Date("2026-07-11T00:10:00Z"));
    expect(loaded.artifact).toBe("v1");
    expect(loaded.usedFallback).toBe(true);
    expect(loaded.warnings[0]).toContain("Primary release failed");
  });
  it("rejects expired or wrong-consumer manifests", async () => {
    const manifest = { schemaVersion: "fisiovision-consumer-deployment-v0.1" as const, consumerId: "other", primary: config("v1"), issuedAt: "2026-07-11T00:00:00Z", expiresAt: "2026-07-11T00:05:00Z" };
    await expect(loadConsumerRelease(manifest, "pilatesvision", async () => ({ artifact: "x", bytes: new Uint8Array() }), async () => true, new Date("2026-07-11T00:10:00Z"))).rejects.toThrow(/consumerId mismatch/);
  });
});
