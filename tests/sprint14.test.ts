import { describe, expect, it } from "vitest";
import { SlidingWindowRateLimiter, bearerToken } from "../src/index.js";

describe("HTTP security primitives", () => {
  it("parses bearer tokens strictly", () => {
    expect(bearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(() => bearerToken("Basic abc")).toThrow(/bearer/);
  });
  it("enforces a sliding-window rate limit", () => {
    const limiter = new SlidingWindowRateLimiter(2, 1000);
    expect(limiter.check("client", 0).allowed).toBe(true);
    expect(limiter.check("client", 100).allowed).toBe(true);
    const blocked = limiter.check("client", 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    expect(limiter.check("client", 1100).allowed).toBe(true);
  });
});
