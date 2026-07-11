import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { bearerToken, verifyConsumerJwt, type JwtVerifierConfig } from "./jwt.js";
import { createConsumerDeployment, type ReleaseSource } from "./integration-api.js";
import { SlidingWindowRateLimiter } from "./rate-limit.js";

export interface ApiLogEvent {
  level: "info" | "warn" | "error";
  event: string;
  requestId: string;
  consumerId?: string;
  subject?: string;
  status: number;
  durationMs: number;
}

export interface DeploymentApiOptions {
  source: ReleaseSource;
  jwt: JwtVerifierConfig;
  rateLimiter?: SlidingWindowRateLimiter;
  logger?: (event: ApiLogEvent) => void;
}

export function createDeploymentHandler(options: DeploymentApiOptions) {
  const limiter = options.rateLimiter ?? new SlidingWindowRateLimiter();
  const logger = options.logger ?? ((event) => console.log(JSON.stringify(event)));
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const started = Date.now(), requestId = request.headers["x-request-id"]?.toString() ?? randomUUID();
    response.setHeader("x-request-id", requestId);
    let consumerId: string | undefined, subject: string | undefined, status = 500;
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const match = /^\/v1\/consumers\/([^/]+)\/deployment$/.exec(url.pathname);
      if (request.method !== "GET" || !match) return send(response, status = 404, { error: "not_found", requestId });
      consumerId = decodeURIComponent(match[1]!);
      const claims = await verifyConsumerJwt(bearerToken(request.headers.authorization), consumerId, options.jwt);
      subject = claims.sub;
      const rate = limiter.check(`${subject}:${consumerId}`);
      response.setHeader("x-ratelimit-remaining", String(rate.remaining));
      if (!rate.allowed) {
        response.setHeader("retry-after", String(rate.retryAfterSeconds));
        return send(response, status = 429, { error: "rate_limited", requestId });
      }
      const releaseId = url.searchParams.get("releaseId");
      if (!releaseId) return send(response, status = 400, { error: "releaseId_required", requestId });
      const manifest = await createConsumerDeployment({ consumerId, releaseId }, options.source);
      response.setHeader("cache-control", "private, no-store");
      return send(response, status = 200, manifest);
    } catch (error) {
      const message = error instanceof Error ? error.message : "internal error";
      const authentication = /JWT|bearer|authorized|signing key/i.test(message);
      status = authentication ? 401 : /not approved/i.test(message) ? 404 : 500;
      return send(response, status, { error: authentication ? "unauthorized" : status === 404 ? "release_not_found" : "internal_error", requestId });
    } finally {
      logger({
        level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
        event: "consumer_deployment_request", requestId,
        ...(consumerId ? { consumerId } : {}),
        ...(subject ? { subject } : {}),
        status, durationMs: Date.now() - started,
      });
    }
  };
}

function send(response: ServerResponse, status: number, body: unknown): void {
  if (response.writableEnded) return;
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}
