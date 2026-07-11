import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createDeploymentHandler } from "./http-api.js";
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
const handler=createDeploymentHandler({
  source:new ReleaseFileStore(releases),
  jwt:{issuer:required("FISIOVISION_JWT_ISSUER"),audience:required("FISIOVISION_JWT_AUDIENCE"),jwksUrl,fetchJwks:(url)=>jwks.fetch(url)},
  ...(redisUrl?{rateLimiter:new RedisFixedWindowRateLimiter(redisUrl)}:{}),
  metrics,
  readiness:()=>releases.some((release)=>release.status==="approved")&&jwks.isReady(),
});
const port=Number(process.env.PORT??8080);
const server=createServer((request,response)=>void handler(request,response));
server.listen(port,()=>console.log(JSON.stringify({level:"info",event:"api_started",port,rateLimiter:redisUrl?"redis":"memory"})));
