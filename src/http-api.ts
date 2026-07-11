import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { bearerToken, verifyConsumerJwt, type JwtVerifierConfig } from "./jwt.js";
import { createConsumerDeployment, type ReleaseSource } from "./integration-api.js";
import { SlidingWindowRateLimiter } from "./rate-limit.js";
import type { AsyncRateLimiter } from "./redis-rate-limit.js";
import { ApiMetrics } from "./prometheus.js";

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
  rateLimiter?: AsyncRateLimiter;
  metrics?: ApiMetrics;
  readiness?: () => boolean;
  logger?: (event: ApiLogEvent) => void;
}
export function createDeploymentHandler(options: DeploymentApiOptions) {
  const limiter = options.rateLimiter ?? new SlidingWindowRateLimiter();
  const metrics = options.metrics ?? new ApiMetrics();
  const logger = options.logger ?? ((event) => console.log(JSON.stringify(event)));
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const started=Date.now(),requestId=request.headers["x-request-id"]?.toString()??randomUUID();
    response.setHeader("x-request-id",requestId);
    let consumerId:string|undefined,subject:string|undefined,status=500;
    try {
      const url=new URL(request.url??"/","http://localhost");
      if(request.method==="GET"&&url.pathname==="/healthz")return send(response,status=200,{status:"ok"});
      if(request.method==="GET"&&url.pathname==="/readyz"){
        const ready=options.readiness?.()??true;
        return send(response,status=ready?200:503,{status:ready?"ready":"not_ready"});
      }
      if(request.method==="GET"&&url.pathname==="/metrics"){
        status=200;response.statusCode=200;response.setHeader("content-type","text/plain; version=0.0.4");response.end(metrics.render());return;
      }
      const match=/^\/v1\/consumers\/([^/]+)\/deployment$/.exec(url.pathname);
      if(request.method!=="GET"||!match)return send(response,status=404,{error:"not_found",requestId});
      consumerId=decodeURIComponent(match[1]!);
      const claims=await verifyConsumerJwt(bearerToken(request.headers.authorization),consumerId,options.jwt);
      subject=claims.sub;
      const rate=await limiter.check(`${subject}:${consumerId}`);
      response.setHeader("x-ratelimit-remaining",String(rate.remaining));
      if(!rate.allowed){response.setHeader("retry-after",String(rate.retryAfterSeconds));return send(response,status=429,{error:"rate_limited",requestId});}
      const releaseId=url.searchParams.get("releaseId");
      if(!releaseId)return send(response,status=400,{error:"releaseId_required",requestId});
      const manifest=await createConsumerDeployment({consumerId,releaseId},options.source);
      if(manifest.fallback)metrics.observeFallback();
      response.setHeader("cache-control","private, no-store");
      return send(response,status=200,manifest);
    } catch(error) {
      const message=error instanceof Error?error.message:"internal error";
      const authentication=/JWT|bearer|authorized|signing key/i.test(message);
      status=authentication?401:/not approved/i.test(message)?404:/Redis|JWKS/i.test(message)?503:500;
      return send(response,status,{error:authentication?"unauthorized":status===404?"release_not_found":status===503?"dependency_unavailable":"internal_error",requestId});
    } finally {
      const durationMs=Date.now()-started;metrics.observe(status,durationMs);
      logger({level:status>=500?"error":status>=400?"warn":"info",event:"consumer_deployment_request",requestId,...(consumerId?{consumerId}:{}),...(subject?{subject}:{}),status,durationMs});
    }
  };
}
function send(response:ServerResponse,status:number,body:unknown):void{if(response.writableEnded)return;response.statusCode=status;response.setHeader("content-type","application/json; charset=utf-8");response.end(JSON.stringify(body));}
