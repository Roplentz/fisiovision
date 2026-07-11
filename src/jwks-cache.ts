export interface JwksDocument { keys: JsonWebKey[] }

export class CachedJwksProvider {
  private cached?: { value: JwksDocument; expiresAt: number };
  private inflight?: Promise<JwksDocument>;

  constructor(private readonly ttlMs = 300_000, private readonly timeoutMs = 5_000) {}

  async fetch(url: string, nowMs = Date.now()): Promise<JwksDocument> {
    if (this.cached && nowMs < this.cached.expiresAt) return this.cached.value;
    if (this.inflight) return this.inflight;
    this.inflight = this.load(url, nowMs);
    try { return await this.inflight; }
    finally { delete this.inflight; }
  }

  isReady(nowMs = Date.now()): boolean {
    return Boolean(this.cached && nowMs < this.cached.expiresAt);
  }

  private async load(url: string, nowMs: number): Promise<JwksDocument> {
    const response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    if (!response.ok) throw new Error("JWKS unavailable");
    const value = await response.json() as JwksDocument;
    if (!Array.isArray(value.keys) || value.keys.length === 0) throw new Error("JWKS has no keys");
    this.cached = { value, expiresAt: nowMs + this.ttlMs };
    return value;
  }
}
