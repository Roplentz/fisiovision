export interface JwtClaims {
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
  nbf?: number;
  consumers?: string[];
}

export interface JwtVerifierConfig {
  issuer: string;
  audience: string;
  jwksUrl: string;
  clockToleranceSeconds?: number;
  fetchJwks?: (url: string) => Promise<{ keys: JsonWebKey[] }>;
}

export async function verifyConsumerJwt(
  token: string,
  consumerId: string,
  config: JwtVerifierConfig,
  now = new Date(),
): Promise<JwtClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid JWT structure");
  const header = parsePart(parts[0]!) as { alg?: string; kid?: string };
  const claims = parsePart(parts[1]!) as Partial<JwtClaims>;
  if (header.alg !== "RS256" || !header.kid) throw new Error("JWT must use RS256 with kid");
  const getJwks = config.fetchJwks ?? defaultFetchJwks;
  const jwks = await getJwks(config.jwksUrl);
  const jwk = jwks.keys.find((key) => (key as JsonWebKey & { kid?: string }).kid === header.kid && key.kty === "RSA");
  if (!jwk) throw new Error("signing key not found");
  const key = await globalThis.crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"],
  );
  const valid = await globalThis.crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, decodeBase64Url(parts[2]!),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) throw new Error("invalid JWT signature");
  const tolerance = config.clockToleranceSeconds ?? 30;
  const epoch = now.getTime() / 1000;
  if (!claims.sub || claims.iss !== config.issuer) throw new Error("invalid JWT issuer or subject");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(config.audience)) throw new Error("invalid JWT audience");
  if (typeof claims.exp !== "number" || epoch - tolerance >= claims.exp) throw new Error("JWT expired");
  if (typeof claims.nbf === "number" && epoch + tolerance < claims.nbf) throw new Error("JWT not active");
  if (!claims.consumers?.includes(consumerId)) throw new Error("consumer not authorized");
  return claims as JwtClaims;
}

export function bearerToken(header: string | undefined): string {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  if (!match) throw new Error("missing bearer token");
  return match[1]!;
}

function parsePart(value: string): unknown {
  try { return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))); }
  catch { throw new Error("invalid JWT encoding"); }
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function defaultFetchJwks(url: string): Promise<{ keys: JsonWebKey[] }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
  if (!response.ok) throw new Error("JWKS unavailable");
  return response.json() as Promise<{ keys: JsonWebKey[] }>;
}
