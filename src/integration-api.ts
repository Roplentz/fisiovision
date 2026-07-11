import type { ConsumerDeploymentManifest } from "./consumer.js";
import type { ConsumerReleaseConfig } from "./deployment.js";
import type { EngineRelease } from "./model-registry.js";
import { toConsumerConfig } from "./deployment.js";

export interface ReleaseSource {
  getApprovedRelease(id: string): Promise<EngineRelease | undefined>;
  getFallbackRelease(id: string): Promise<EngineRelease | undefined>;
}

export interface DeploymentRequest {
  consumerId: string;
  releaseId: string;
  ttlSeconds?: number;
}

export async function createConsumerDeployment(
  request: DeploymentRequest,
  source: ReleaseSource,
  now = new Date(),
): Promise<ConsumerDeploymentManifest> {
  if (!request.consumerId.trim()) throw new Error("consumerId is required");
  const primary = await source.getApprovedRelease(request.releaseId);
  if (!primary || primary.status !== "approved") throw new Error("requested release is not approved");
  const fallback = await source.getFallbackRelease(primary.id);
  if (fallback && fallback.status !== "approved") throw new Error("fallback release is not approved");
  const ttlSeconds = request.ttlSeconds ?? 300;
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > 3600) throw new Error("ttlSeconds must be between 30 and 3600");
  const primaryConfig = toConsumerConfig(request.consumerId, primary, now);
  const fallbackConfig: ConsumerReleaseConfig | undefined = fallback
    ? toConsumerConfig(request.consumerId, fallback, now)
    : undefined;
  return {
    schemaVersion: "fisiovision-consumer-deployment-v0.1",
    consumerId: request.consumerId,
    primary: primaryConfig,
    ...(fallbackConfig ? { fallback: fallbackConfig } : {}),
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
  };
}
