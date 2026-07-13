import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createDeploymentHandler } from "./http-api.js";
import { AnalysisService, InMemoryAnalysisStore } from "./analysis-jobs.js";
import { SupabaseAnalysisStore } from "./supabase-analysis-store.js";
import { createAnalysisHandler } from "./analysis-http-api.js";
import { ReleaseFileStore } from "./release-file-store.js";
import { CachedJwksProvider } from "./jwks-cache.js";
import { ApiMetrics } from "./prometheus.js";
import { RedisFixedWindowRateLimiter } from "./redis-rate-limit.js";
import type { EngineRelease } from "./model-registry.js";

const required=(name:string):string=>{const value=process.env[name];if(!value)throw new Error(`Missing environment variable: ${name}`);return value};
const releases=JSON.parse(await readFile(required("FISIOVISION_RELEASES_FILE"),"utf8")) as EngineRelease[];
const jwksUrl=required("FISIOVISION_JWKS_URL"),jwks=new CachedJwksProvider(),metrics=new ApiMetrics();
await jwks.fetch(jwksUrl);
const redisUrl=process.env.FISIOVISION_REDIS_URL;
const rateLimiter=redisUrl?new RedisFixedWindowRateLimiter(redisUrl):undefined;
const handler=createDeploymentHandler({
  source:new ReleaseFileStore(releases),
  jwt:{issuer:required("FISIOVISION_JWT_ISSUER"),audience:required("FISIOVISION_JWT_AUDIENCE"),jwksUrl,fetchJwks:(url)=>jwks.fetch(url)},
  ...(rateLimiter?{rateLimiter}:{}),
  metrics,
  readiness:()=>releases.some((release)=>release.status==="approved")&&jwks.isReady(),
});
const analysisStore=process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY?new SupabaseAnalysisStore({url:process.env.SUPABASE_URL,serviceRoleKey:process.env.SUPABASE_SERVICE_ROLE_KEY}):new InMemoryAnalysisStore();
const analysisHandler=createAnalysisHandler({service:new AnalysisService(analysisStore),jwt:{issuer:required("FISIOVISION_JWT_ISSUER"),audience:required("FISIOVISION_JWT_AUDIENCE"),jwksUrl,fetchJwks:(url)=>jwks.fetch(url)},...(rateLimiter?{rateLimiter}:{})});
const port=Number(process.env.PORT??8080);
const server=createServer((request,response)=>void analysisHandler(request,response).then(handled=>handled?undefined:handler(request,response)));
server.listen(port,()=>console.log(JSON.stringify({level:"info",event:"api_started",port,rateLimiter:redisUrl?"redis":"memory"})));
