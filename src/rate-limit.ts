export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class SlidingWindowRateLimiter {
  private readonly requests = new Map<string, number[]>();

  constructor(private readonly limit = 60, private readonly windowMs = 60_000) {
    if (!Number.isInteger(limit) || limit <= 0 || windowMs <= 0) throw new Error("invalid rate limit");
  }

  check(key: string, nowMs = Date.now()): RateLimitDecision {
    const cutoff = nowMs - this.windowMs;
    const recent = (this.requests.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= this.limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((recent[0]! + this.windowMs - nowMs) / 1000));
      this.requests.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }
    recent.push(nowMs);
    this.requests.set(key, recent);
    return { allowed: true, remaining: this.limit - recent.length, retryAfterSeconds: 0 };
  }
}
