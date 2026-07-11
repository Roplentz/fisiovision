export type AuditAction = "release_activated" | "release_rolled_back" | "release_deprecated";

export interface AuditPayload {
  action: AuditAction;
  actorId: string;
  releaseId: string;
  previousReleaseId?: string;
  reason: string;
  occurredAt: string;
}

export interface SignedAuditEvent {
  schemaVersion: "fisiovision-audit-v0.1";
  sequence: number;
  previousHash: string | null;
  payload: AuditPayload;
  hash: string;
  signature: string;
  keyId: string;
}

export type AuditSigner = (hash: string) => Promise<{ signature: string; keyId: string }>;

export async function createSignedAuditEvent(
  payload: AuditPayload,
  sequence: number,
  previous: SignedAuditEvent | undefined,
  signer: AuditSigner,
): Promise<SignedAuditEvent> {
  if (!payload.actorId.trim() || !payload.reason.trim()) throw new Error("actorId and reason are required");
  if (sequence !== (previous?.sequence ?? 0) + 1) throw new Error("invalid audit sequence");
  const previousHash = previous?.hash ?? null;
  const hash = await sha256(stableStringify({ sequence, previousHash, payload }));
  const signed = await signer(hash);
  if (!signed.signature.trim() || !signed.keyId.trim()) throw new Error("signer returned an invalid signature");
  return { schemaVersion: "fisiovision-audit-v0.1", sequence, previousHash, payload, hash, ...signed };
}

export async function verifyAuditChain(
  events: readonly SignedAuditEvent[],
  verifySignature: (hash: string, signature: string, keyId: string) => Promise<boolean>,
): Promise<{ valid: boolean; failedSequence?: number }> {
  let previous: SignedAuditEvent | undefined;
  for (const event of events) {
    const expected = await sha256(stableStringify({
      sequence: event.sequence,
      previousHash: previous?.hash ?? null,
      payload: event.payload,
    }));
    const signatureValid = await verifySignature(event.hash, event.signature, event.keyId);
    if (
      event.sequence !== (previous?.sequence ?? 0) + 1 ||
      event.previousHash !== (previous?.hash ?? null) ||
      event.hash !== expected ||
      !signatureValid
    ) return { valid: false, failedSequence: event.sequence };
    previous = event;
  }
  return { valid: true };
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
