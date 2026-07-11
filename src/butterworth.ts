export interface ButterworthOptions {
  samplingHz: number;
  cutoffHz: number;
  zeroPhase?: boolean;
}

export function butterworthLowPass(values: readonly number[], options: ButterworthOptions): number[] {
  const { samplingHz, cutoffHz } = options;
  if (samplingHz <= 0 || cutoffHz <= 0 || cutoffHz >= samplingHz / 2) {
    throw new Error("cutoffHz must be between zero and Nyquist frequency");
  }
  if (values.some((value) => !Number.isFinite(value))) throw new Error("signal must contain only finite values");
  if (values.length < 3) return [...values];
  const ita = 1 / Math.tan(Math.PI * cutoffHz / samplingHz);
  const q = Math.SQRT2;
  const b0 = 1 / (1 + q * ita + ita * ita);
  const b1 = 2 * b0;
  const b2 = b0;
  const a1 = 2 * (ita * ita - 1) * b0;
  const a2 = -(1 - q * ita + ita * ita) * b0;
  const filtered = apply(values, b0, b1, b2, a1, a2);
  if (options.zeroPhase === false) return filtered;
  return apply([...filtered].reverse(), b0, b1, b2, a1, a2).reverse();
}

function apply(values: readonly number[], b0: number, b1: number, b2: number, a1: number, a2: number): number[] {
  const output: number[] = [];
  let x1 = values[0]!, x2 = values[0]!, y1 = values[0]!, y2 = values[0]!;
  for (const x0 of values) {
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 + a1 * y1 + a2 * y2;
    output.push(y0); x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return output;
}
