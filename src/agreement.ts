import { mean } from "./math.js";

export interface AgreementReport {
  samples: number;
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  bias: number;
  limitsOfAgreement95: [number, number];
}

export function compareMeasurements(reference: readonly number[], candidate: readonly number[]): AgreementReport {
  if (reference.length !== candidate.length || reference.length < 2) throw new Error("paired measurements require equal length >= 2");
  const differences = candidate.map((value, index) => value - reference[index]!);
  if ([...reference, ...candidate].some((value) => !Number.isFinite(value))) throw new Error("measurements must be finite");
  const bias = mean(differences);
  const variance = differences.reduce((sum, value) => sum + (value - bias) ** 2, 0) / (differences.length - 1);
  const standardDeviation = Math.sqrt(variance);
  return {
    samples: differences.length,
    meanAbsoluteError: mean(differences.map(Math.abs)),
    rootMeanSquareError: Math.sqrt(mean(differences.map((value) => value ** 2))),
    bias,
    limitsOfAgreement95: [bias - 1.96 * standardDeviation, bias + 1.96 * standardDeviation],
  };
}
