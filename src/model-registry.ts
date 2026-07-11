import type { AggregateValidationReport } from "./aggregate-validation.js";

export type ReleaseStatus = "research" | "candidate" | "approved" | "deprecated";

export interface EngineRelease {
  id: string;
  engineVersion: string;
  protocolId: string;
  protocolVersion: string;
  modelName: string;
  modelVersion: string;
  modelChecksum: string;
  createdAt: string;
  status: ReleaseStatus;
  validation: AggregateValidationReport;
}

export interface PromotionPolicy {
  minimumSamples: number;
  minimumAccuracy: number;
  minimumSensitivity: number;
  minimumSpecificity: number;
  maximumRepetitionMae: number;
  maximumRejectionRate: number;
  requireNoStatusRegression: boolean;
}

export interface PromotionDecision {
  eligible: boolean;
  reasons: string[];
  evaluatedAt: string;
  policy: PromotionPolicy;
}

export interface ReleaseComparison {
  baselineId: string;
  candidateId: string;
  deltas: {
    accuracy: number;
    sensitivity: number | null;
    specificity: number | null;
    repetitionMae: number | null;
    rejectionRate: number;
  };
  regressions: string[];
}

export function evaluatePromotion(
  release: EngineRelease,
  policy: PromotionPolicy,
  baseline?: EngineRelease,
  now = new Date(),
): PromotionDecision {
  const report = release.validation;
  const reasons: string[] = [];
  if (report.samples < policy.minimumSamples) reasons.push(`Amostras: ${report.samples} < ${policy.minimumSamples}`);
  checkMinimum("Acurácia", report.accuracy, policy.minimumAccuracy, reasons);
  checkMinimum("Sensibilidade", report.sensitivity, policy.minimumSensitivity, reasons);
  checkMinimum("Especificidade", report.specificity, policy.minimumSpecificity, reasons);
  if (report.repetitionMae === null) reasons.push("MAE de repetições indisponível");
  else if (report.repetitionMae > policy.maximumRepetitionMae) reasons.push(`MAE: ${report.repetitionMae} > ${policy.maximumRepetitionMae}`);
  if (report.rejectionRate > policy.maximumRejectionRate) reasons.push(`Taxa de rejeição: ${report.rejectionRate} > ${policy.maximumRejectionRate}`);
  if (baseline && policy.requireNoStatusRegression) {
    reasons.push(...compareReleases(baseline, release).regressions.map((reason) => `Regressão: ${reason}`));
  }
  return { eligible: reasons.length === 0, reasons, evaluatedAt: now.toISOString(), policy };
}

export function compareReleases(baseline: EngineRelease, candidate: EngineRelease): ReleaseComparison {
  const a = baseline.validation;
  const b = candidate.validation;
  const sensitivity = nullableDelta(b.sensitivity, a.sensitivity);
  const specificity = nullableDelta(b.specificity, a.specificity);
  const mae = nullableDelta(b.repetitionMae, a.repetitionMae);
  const deltas = {
    accuracy: b.accuracy - a.accuracy,
    sensitivity,
    specificity,
    repetitionMae: mae,
    rejectionRate: b.rejectionRate - a.rejectionRate,
  };
  const regressions: string[] = [];
  if (deltas.accuracy < 0) regressions.push("acurácia diminuiu");
  if (sensitivity !== null && sensitivity < 0) regressions.push("sensibilidade diminuiu");
  if (specificity !== null && specificity < 0) regressions.push("especificidade diminuiu");
  if (mae !== null && mae > 0) regressions.push("MAE aumentou");
  if (deltas.rejectionRate > 0) regressions.push("taxa de rejeição aumentou");
  return { baselineId: baseline.id, candidateId: candidate.id, deltas, regressions };
}

export class ReleaseRegistry {
  private readonly releases = new Map<string, EngineRelease>();

  register(release: EngineRelease): void {
    if (this.releases.has(release.id)) throw new Error(`Release already registered: ${release.id}`);
    if (!release.modelChecksum.trim()) throw new Error("modelChecksum is required");
    this.releases.set(release.id, structuredClone(release));
  }

  get(id: string): EngineRelease | undefined {
    const release = this.releases.get(id);
    return release ? structuredClone(release) : undefined;
  }

  promote(id: string, decision: PromotionDecision): EngineRelease {
    const release = this.releases.get(id);
    if (!release) throw new Error(`Unknown release: ${id}`);
    if (!decision.eligible) throw new Error(`Promotion blocked: ${decision.reasons.join("; ")}`);
    release.status = "approved";
    return structuredClone(release);
  }

  deprecate(id: string): EngineRelease {
    const release = this.releases.get(id);
    if (!release) throw new Error(`Unknown release: ${id}`);
    release.status = "deprecated";
    return structuredClone(release);
  }

  list(): EngineRelease[] {
    return [...this.releases.values()].map((release) => structuredClone(release));
  }
}

function checkMinimum(label: string, value: number | null, minimum: number, reasons: string[]): void {
  if (value === null) reasons.push(`${label} indisponível`);
  else if (value < minimum) reasons.push(`${label}: ${value} < ${minimum}`);
}

function nullableDelta(candidate: number | null, baseline: number | null): number | null {
  return candidate === null || baseline === null ? null : candidate - baseline;
}
