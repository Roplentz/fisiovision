import { describe, expect, it, vi } from "vitest";
import { ApiMetrics, CachedJwksProvider } from "../src/index.js";

describe("operational readiness", () => {
  it("caches JWKS within TTL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ keys: [{ kty: "RSA", kid: "1" }] }), { status: 200 }));
    const cache = new CachedJwksProvider(1000);
    await cache.fetch("https://issuer/jwks", 0);
    await cache.fetch("https://issuer/jwks", 500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cache.isReady(500)).toBe(true);
    fetchMock.mockRestore();
  });
  it("renders Prometheus counters without sensitive labels", () => {
    const metrics = new ApiMetrics();
    metrics.observe(200, 125);
    metrics.observe(401, 10);
    const output = metrics.render();
    expect(output).toContain('fisiovision_http_requests_total{status="200"} 1');
    expect(output).not.toContain("token");
  });
});
