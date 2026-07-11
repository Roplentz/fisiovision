import type { ClinicalProtocol } from "./protocol.js";
import { validateProtocol } from "./protocol.js";

export class ProtocolRegistry {
  private readonly protocols = new Map<string, ClinicalProtocol>();

  register(protocol: ClinicalProtocol): void {
    const validation = validateProtocol(protocol);
    if (!validation.valid) throw new Error(`Invalid protocol: ${validation.errors.join("; ")}`);
    const key = this.key(protocol.id, protocol.version);
    if (this.protocols.has(key)) throw new Error(`Protocol already registered: ${key}`);
    this.protocols.set(key, protocol);
  }

  get(id: string, version?: string): ClinicalProtocol | undefined {
    if (version) return this.protocols.get(this.key(id, version));
    return this.list(id).sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
  }

  list(id?: string): ClinicalProtocol[] {
    return [...this.protocols.values()].filter((protocol) => !id || protocol.id === id);
  }

  private key(id: string, version: string): string {
    return `${id}@${version}`;
  }
}
