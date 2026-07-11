import type { ConsumerReleaseConfig } from "./deployment.js";

export interface ConsumerDeploymentManifest {
  schemaVersion: "fisiovision-consumer-deployment-v0.1";
  consumerId: string;
  primary: ConsumerReleaseConfig;
  fallback?: ConsumerReleaseConfig;
  issuedAt: string;
  expiresAt: string;
}

export interface LoadedConsumerRelease<T> {
  config: ConsumerReleaseConfig;
  artifact: T;
  usedFallback: boolean;
  warnings: string[];
}

export type ArtifactLoader<T> = (config: ConsumerReleaseConfig) => Promise<{ artifact: T; bytes: Uint8Array }>;
export type ChecksumVerifier = (bytes: Uint8Array, expectedChecksum: string) => Promise<boolean>;

export function validateDeploymentManifest(
  manifest: ConsumerDeploymentManifest,
  consumerId: string,
  now = new Date(),
): string[] {
  const errors: string[] = [];
  if (manifest.schemaVersion !== "fisiovision-consumer-deployment-v0.1") errors.push("unsupported deployment schema");
  if (manifest.consumerId !== consumerId) errors.push("consumerId mismatch");
  if (manifest.primary.consumerId !== consumerId) errors.push("primary consumerId mismatch");
  if (manifest.fallback?.consumerId !== consumerId) errors.push("fallback consumerId mismatch");
  if (manifest.fallback?.activeReleaseId === manifest.primary.activeReleaseId) errors.push("fallback must use a different release");
  if (manifest.fallback && manifest.fallback.protocolId !== manifest.primary.protocolId) errors.push("fallback protocol mismatch");
  const issuedAt = Date.parse(manifest.issuedAt);
  const expiresAt = Date.parse(manifest.expiresAt);
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || expiresAt <= issuedAt) errors.push("invalid validity window");
  if (Number.isFinite(expiresAt) && now.getTime() >= expiresAt) errors.push("deployment manifest expired");
  return errors;
}

export async function loadConsumerRelease<T>(
  manifest: ConsumerDeploymentManifest,
  consumerId: string,
  load: ArtifactLoader<T>,
  verifyChecksum: ChecksumVerifier = verifySha256Checksum,
  now = new Date(),
): Promise<LoadedConsumerRelease<T>> {
  const errors = validateDeploymentManifest(manifest, consumerId, now);
  if (errors.length) throw new Error(`Invalid deployment manifest: ${errors.join("; ")}`);
  try {
    const loaded = await loadAndVerify(manifest.primary, load, verifyChecksum);
    return { ...loaded, usedFallback: false, warnings: [] };
  } catch (primaryError) {
    if (!manifest.fallback) throw primaryError;
    const loaded = await loadAndVerify(manifest.fallback, load, verifyChecksum);
    return {
      ...loaded,
      usedFallback: true,
      warnings: [`Primary release failed: ${message(primaryError)}`],
    };
  }
}

export async function verifySha256Checksum(bytes: Uint8Array, expectedChecksum: string): Promise<boolean> {
  const match = /^sha256:([a-f0-9]{64})$/i.exec(expectedChecksum);
  if (!match) return false;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  const actual = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return actual.toLowerCase() === match[1]!.toLowerCase();
}

async function loadAndVerify<T>(
  config: ConsumerReleaseConfig,
  load: ArtifactLoader<T>,
  verify: ChecksumVerifier,
): Promise<{ config: ConsumerReleaseConfig; artifact: T }> {
  const loaded = await load(config);
  if (!await verify(loaded.bytes, config.modelChecksum)) {
    throw new Error(`checksum verification failed for ${config.activeReleaseId}`);
  }
  return { config, artifact: loaded.artifact };
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
