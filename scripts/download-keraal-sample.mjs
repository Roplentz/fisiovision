import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

if (!process.argv.includes("--accept-noncommercial")) {
  throw new Error("Keraal is CC-BY-NC-SA. Re-run with --accept-noncommercial for research benchmark use only.");
}
const url = "https://keraal.enstb.org/data/keraal_sample_2022.zip";
const outputDir = resolve("data/public/keraal");
await mkdir(outputDir, { recursive: true });
const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(120_000) });
if (!response.ok) throw new Error(`download failed: ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
const maximumBytes = 2_000_000_000;
if (bytes.byteLength > maximumBytes) throw new Error("sample exceeds configured size limit");
const file = resolve(outputDir, basename(new URL(url).pathname));
const sha256 = createHash("sha256").update(bytes).digest("hex");
await writeFile(file, bytes);
await writeFile(resolve(outputDir, "DOWNLOAD.json"), JSON.stringify({
  schemaVersion: "fisiovision-download-record-v0.1",
  datasetId: "keraal",
  sourceUrl: url,
  downloadedAt: new Date().toISOString(),
  bytes: bytes.byteLength,
  sha256: "sha256:" + sha256,
  acceptedLicense: "CC-BY-NC-SA",
  purpose: "research benchmark only"
}, null, 2) + "\n");
console.log(JSON.stringify({ event: "dataset_downloaded", datasetId: "keraal", file, bytes: bytes.byteLength, sha256 }));
