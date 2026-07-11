import type { AuditSigner, SignedAuditEvent } from "./audit.js";
import { createSignedAuditEvent } from "./audit.js";
import type { EngineRelease } from "./model-registry.js";

export interface ConsumerReleaseConfig {
  schemaVersion: "fisiovision-consumer-config-v0.1";
  consumerId: string;
  activeReleaseId: string;
  engineVersion: string;
  protocolId: string;
  protocolVersion: string;
  modelName: string;
  modelVersion: string;
  modelChecksum: string;
  activatedAt: string;
}

export interface DeploymentState {
  consumerId: string;
  activeReleaseId?: string;
  history: string[];
  audit: SignedAuditEvent[];
}

export class DeploymentController {
  private readonly releases = new Map<string, EngineRelease>();
  private readonly state: DeploymentState;

  constructor(consumerId: string, releases: readonly EngineRelease[] = []) {
    this.state = { consumerId, history: [], audit: [] };
    releases.forEach((release) => this.releases.set(release.id, structuredClone(release)));
  }

  register(release: EngineRelease): void {
    this.releases.set(release.id, structuredClone(release));
  }

  async activate(releaseId: string, actorId: string, reason: string, signer: AuditSigner, now = new Date()): Promise<ConsumerReleaseConfig> {
    const release = this.requireApproved(releaseId);
    const previousReleaseId = this.state.activeReleaseId;
    if (previousReleaseId === releaseId) throw new Error("release is already active");
    if (previousReleaseId) this.state.history.push(previousReleaseId);
    this.state.activeReleaseId = releaseId;
    await this.appendAudit({
      action: "release_activated", actorId, releaseId,
      ...(previousReleaseId ? { previousReleaseId } : {}),
      reason, occurredAt: now.toISOString(),
    }, signer);
    return toConsumerConfig(this.state.consumerId, release, now);
  }

  async rollback(actorId: string, reason: string, signer: AuditSigner, now = new Date()): Promise<ConsumerReleaseConfig> {
    const targetId = this.state.history.pop();
    if (!targetId) throw new Error("no approved release available for rollback");
    const release = this.requireApproved(targetId);
    const previousReleaseId = this.state.activeReleaseId;
    this.state.activeReleaseId = targetId;
    await this.appendAudit({
      action: "release_rolled_back", actorId, releaseId: targetId,
      ...(previousReleaseId ? { previousReleaseId } : {}),
      reason, occurredAt: now.toISOString(),
    }, signer);
    return toConsumerConfig(this.state.consumerId, release, now);
  }

  snapshot(): DeploymentState {
    return structuredClone(this.state);
  }

  private requireApproved(id: string): EngineRelease {
    const release = this.releases.get(id);
    if (!release) throw new Error(`unknown release: ${id}`);
    if (release.status !== "approved") throw new Error(`release is not approved: ${id}`);
    return release;
  }

  private async appendAudit(payload: Parameters<typeof createSignedAuditEvent>[0], signer: AuditSigner): Promise<void> {
    const previous = this.state.audit.at(-1);
    this.state.audit.push(await createSignedAuditEvent(payload, this.state.audit.length + 1, previous, signer));
  }
}

export function toConsumerConfig(consumerId: string, release: EngineRelease, now = new Date()): ConsumerReleaseConfig {
  if (release.status !== "approved") throw new Error("consumer config requires an approved release");
  return {
    schemaVersion: "fisiovision-consumer-config-v0.1",
    consumerId,
    activeReleaseId: release.id,
    engineVersion: release.engineVersion,
    protocolId: release.protocolId,
    protocolVersion: release.protocolVersion,
    modelName: release.modelName,
    modelVersion: release.modelVersion,
    modelChecksum: release.modelChecksum,
    activatedAt: now.toISOString(),
  };
}
