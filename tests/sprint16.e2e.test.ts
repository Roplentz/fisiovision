import { createServer } from "node:http";
import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  ApiMetrics, ReleaseFileStore, SlidingWindowRateLimiter, createDeploymentHandler,
  loadConsumerRelease, type AggregateValidationReport, type EngineRelease,
} from "../src/index.js";

const servers: Array<ReturnType<typeof createServer>> = [];
afterEach(async () => Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve())))));

const validation: AggregateValidationReport = {
  schemaVersion: "fisiovision-aggregate-v0.1", samples: 100,
  matrix: { trueAccepted: 45, trueRejected: 45, falseAccepted: 5, falseRejected: 5 },
  accuracy: .9, sensitivity: .9, specificity: .9, repetitionMae: .2, rejectionRate: .5,
  statusMismatches: [], countMismatches: [],
};
function release(id: string): EngineRelease {
  return { id, engineVersion: id, protocolId: "squat", protocolVersion: "0.1.0", modelName: "pose", modelVersion: id, modelChecksum: "sha256:"+id.padEnd(64, "0"), createdAt: "2026-07-11T00:00:00Z", status: "approved", validation };
}
function jwt(privateKey: ReturnType<typeof generateKeyPairSync>["privateKey"], kid: string): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "RS256", kid, typ: "JWT" });
  const payload = encode({ sub: "pilatesvision-staging", iss: "https://issuer.staging", aud: "fisiovision-api", exp: Math.floor(Date.now()/1000)+300, consumers: ["pilatesvision"] });
  const unsigned = header+"."+payload;
  return unsigned+"."+sign("RSA-SHA256", Buffer.from(unsigned), privateKey).toString("base64url");
}

describe("staging E2E", () => {
  it("authenticates, serves approved deployment and performs consumer fallback", async () => {
    const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const kid = "staging-key-1";
    const jwk = { ...keys.publicKey.export({ format: "jwk" }), kid, alg: "RS256", use: "sig" };
    const metrics = new ApiMetrics();
    const handler = createDeploymentHandler({
      source: new ReleaseFileStore([release("v2"), release("v1")]),
      jwt: { issuer: "https://issuer.staging", audience: "fisiovision-api", jwksUrl: "https://issuer.staging/jwks", fetchJwks: async () => ({ keys: [jwk] }) },
      rateLimiter: new SlidingWindowRateLimiter(10, 60_000),
      metrics,
      readiness: () => true,
      logger: () => undefined,
    });
    const server = createServer((request, response) => void handler(request, response));
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("server address unavailable");
    const response = await fetch(`http://127.0.0.1:${address.port}/v1/consumers/pilatesvision/deployment?releaseId=v2`, { headers: { authorization: "Bearer "+jwt(keys.privateKey, kid) } });
    expect(response.status).toBe(200);
    const manifest = await response.json() as Parameters<typeof loadConsumerRelease<string>>[0];
    const loaded = await loadConsumerRelease(manifest, "pilatesvision", async (config) => ({ artifact: config.activeReleaseId, bytes: new Uint8Array([1]) }), async (_bytes, checksum) => checksum.includes("v1"));
    expect(loaded.usedFallback).toBe(true);
    expect(loaded.artifact).toBe("v1");
    expect(metrics.render()).toContain('status="200"');
  });

  it("exposes health and rejects missing JWT", async () => {
    const handler = createDeploymentHandler({
      source: new ReleaseFileStore([release("v1")]),
      jwt: { issuer: "x", audience: "y", jwksUrl: "https://x/jwks" },
      logger: () => undefined,
    });
    const server = createServer((request, response) => void handler(request, response));
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("server address unavailable");
    expect((await fetch(`http://127.0.0.1:${address.port}/healthz`)).status).toBe(200);
    expect((await fetch(`http://127.0.0.1:${address.port}/v1/consumers/pilatesvision/deployment?releaseId=v1`)).status).toBe(401);
  });
});
