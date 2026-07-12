import type { DatasetManifest } from "./dataset.js";

export type M3GymResearchPurpose =
  | "external-validation"
  | "method-comparison"
  | "academic-publication";

export interface M3GymUseDecision {
  allowed: boolean;
  errors: string[];
}

export interface M3GymProvenance {
  dataset: "M3GYM";
  accessAgreementVersion: string;
  approvedInstitution: string;
  approvalReference: string;
  purpose: M3GymResearchPurpose;
  commercialUse: false;
  modelTraining: false;
  redistribution: false;
}

export function authorizeM3GymResearchUse(
  manifest: DatasetManifest,
  provenance: M3GymProvenance,
): M3GymUseDecision {
  const errors: string[] = [];
  if (manifest.license !== "research-agreement") errors.push("M3GYM must use research-agreement license");
  if (!/m3gym/i.test(manifest.id + manifest.title + manifest.source)) errors.push("manifest must identify M3GYM");
  if (manifest.containsIdentifiableMedia) errors.push("M3GYM media must remain outside the repository");
  if (!manifest.consentOrLegalBasis.toLowerCase().includes("non-commercial")) {
    errors.push("legal basis must state non-commercial use");
  }
  if (!provenance.accessAgreementVersion.trim() || /pending/i.test(provenance.accessAgreementVersion)) errors.push("final access agreement version is required");
  if (!provenance.approvedInstitution.trim()) errors.push("approved institution is required");
  if (!provenance.approvalReference.trim() || /pending/i.test(provenance.approvalReference)) errors.push("final approval reference is required");
  if (provenance.commercialUse !== false) errors.push("commercial use is prohibited");
  if (provenance.modelTraining !== false) errors.push("model training is disabled for this validation boundary");
  if (provenance.redistribution !== false) errors.push("redistribution is prohibited");
  return { allowed: errors.length === 0, errors };
}

export function assertM3GymResearchUse(manifest: DatasetManifest, provenance: M3GymProvenance): void {
  const decision = authorizeM3GymResearchUse(manifest, provenance);
  if (!decision.allowed) throw new Error(`M3GYM use denied: ${decision.errors.join("; ")}`);
}
