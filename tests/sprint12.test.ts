import { describe, expect, it } from "vitest";
import { DeploymentController, createSignedAuditEvent, verifyAuditChain, type AggregateValidationReport, type AuditSigner, type EngineRelease } from "../src/index.js";

const validation: AggregateValidationReport = {
  schemaVersion: "fisiovision-aggregate-v0.1", samples: 100,
  matrix: { trueAccepted: 45, trueRejected: 45, falseAccepted: 5, falseRejected: 5 },
  accuracy: .9, sensitivity: .9, specificity: .9, repetitionMae: .2, rejectionRate: .5,
  statusMismatches: [], countMismatches: [],
};
function release(id: string, status: EngineRelease["status"] = "approved"): EngineRelease {
  return { id, engineVersion: id, protocolId: "squat", protocolVersion: "0.1.0", modelName: "pose", modelVersion: id, modelChecksum: "sha256:"+id, createdAt: "2026-07-11T00:00:00Z", status, validation };
}
const signer: AuditSigner = async (hash) => ({ signature: "signed:"+hash, keyId: "test-key" });
const verify = async (hash: string, signature: string) => signature === "signed:"+hash;

describe("signed audit", () => {
  it("creates and verifies a hash chain", async () => {
    const first = await createSignedAuditEvent({ action: "release_activated", actorId: "admin", releaseId: "v1", reason: "initial", occurredAt: "2026-07-11T00:00:00Z" }, 1, undefined, signer);
    const second = await createSignedAuditEvent({ action: "release_rolled_back", actorId: "admin", releaseId: "v0", previousReleaseId: "v1", reason: "regression", occurredAt: "2026-07-11T01:00:00Z" }, 2, first, signer);
    expect((await verifyAuditChain([first, second], verify)).valid).toBe(true);
    const tampered = structuredClone(second); tampered.payload.reason = "changed";
    expect((await verifyAuditChain([first, tampered], verify)).valid).toBe(false);
  });
});

describe("operational deployment", () => {
  it("activates approved releases and rolls back", async () => {
    const controller = new DeploymentController("pilatesvision", [release("v1"), release("v2")]);
    await controller.activate("v1", "admin", "initial", signer);
    await controller.activate("v2", "admin", "upgrade", signer);
    const config = await controller.rollback("admin", "regression", signer);
    expect(config.activeReleaseId).toBe("v1");
    expect(controller.snapshot().audit).toHaveLength(3);
  });
  it("blocks unapproved releases", async () => {
    const controller = new DeploymentController("consumer", [release("candidate", "candidate")]);
    await expect(controller.activate("candidate", "admin", "try", signer)).rejects.toThrow(/not approved/);
  });
});
