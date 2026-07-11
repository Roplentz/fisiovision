import { connect } from "node:net";
import type { RateLimitDecision } from "./rate-limit.js";

export interface AsyncRateLimiter {
  check(key: string, nowMs?: number): Promise<RateLimitDecision> | RateLimitDecision;
}

export class RedisFixedWindowRateLimiter implements AsyncRateLimiter {
  private readonly host: string;
  private readonly port: number;

  constructor(redisUrl: string, private readonly limit = 60, private readonly windowMs = 60_000) {
    const url = new URL(redisUrl);
    if (url.protocol !== "redis:") throw new Error("only redis:// URLs are supported");
    this.host = url.hostname;
    this.port = Number(url.port || 6379);
  }

  async check(key: string, nowMs = Date.now()): Promise<RateLimitDecision> {
    const bucket = Math.floor(nowMs / this.windowMs);
    const redisKey = `fisiovision:ratelimit:${safeKey(key)}:${bucket}`;
    const count = Number(await command(this.host, this.port, ["INCR", redisKey]));
    if (count === 1) await command(this.host, this.port, ["PEXPIRE", redisKey, String(this.windowMs)]);
    const remainingMs = this.windowMs - (nowMs % this.windowMs);
    return {
      allowed: count <= this.limit,
      remaining: Math.max(0, this.limit - count),
      retryAfterSeconds: count <= this.limit ? 0 : Math.max(1, Math.ceil(remainingMs / 1000)),
    };
  }
}

function command(host: string, port: number, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port });
    const payload = `*${args.length}\r\n${args.map((arg) => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`).join("")}`;
    let data = "";
    const timer = setTimeout(() => socket.destroy(new Error("Redis timeout")), 2_000);
    socket.once("connect", () => socket.write(payload));
    socket.on("data", (chunk) => {
      data += chunk.toString();
      if (data.includes("\r\n")) {
        clearTimeout(timer); socket.end();
        if (data.startsWith("-")) reject(new Error("Redis command failed"));
        else resolve(data.slice(1).split("\r\n")[0] ?? "");
      }
    });
    socket.once("error", (error) => { clearTimeout(timer); reject(error); });
  });
}

function safeKey(value: string): string {
  return Buffer.from(value).toString("base64url");
}
