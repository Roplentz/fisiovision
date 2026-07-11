import type { EngineRelease } from "./model-registry.js";
import type { ReleaseSource } from "./integration-api.js";

export class ReleaseFileStore implements ReleaseSource {
  private readonly releases: EngineRelease[];

  constructor(releases: readonly EngineRelease[]) {
    this.releases = releases.map((release) => structuredClone(release));
  }

  async getApprovedRelease(id: string): Promise<EngineRelease | undefined> {
    const release = this.releases.find((item) => item.id === id && item.status === "approved");
    return release ? structuredClone(release) : undefined;
  }

  async getFallbackRelease(id: string): Promise<EngineRelease | undefined> {
    const primaryIndex = this.releases.findIndex((item) => item.id === id);
    const fallback = this.releases.slice(primaryIndex + 1).find((item) => item.status === "approved");
    return fallback ? structuredClone(fallback) : undefined;
  }
}
