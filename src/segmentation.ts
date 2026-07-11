export type SquatPhase = "standing" | "descent" | "bottom" | "ascent" | "standing_end";

export interface SquatSample {
  timestampMs: number;
  hipY: number;
  kneeAngle: number;
}

export interface RepetitionSegment {
  startIndex: number;
  bottomIndex: number;
  endIndex: number;
  phases: SquatPhase[];
}

export interface SegmentationOptions {
  minimumDepth: number;
  standingTolerance: number;
  minimumDurationMs: number;
}

const DEFAULTS: SegmentationOptions = {
  minimumDepth: 0.08,
  standingTolerance: 0.035,
  minimumDurationMs: 500,
};

export function segmentSquats(
  samples: readonly SquatSample[],
  options: Partial<SegmentationOptions> = {},
): RepetitionSegment[] {
  if (samples.length < 3) return [];
  const config = { ...DEFAULTS, ...options };
  const repetitions: RepetitionSegment[] = [];
  let start = -1;
  let bottom = -1;
  for (let i = 1; i < samples.length; i += 1) {
    const delta = samples[i]!.hipY - samples[i - 1]!.hipY;
    if (start < 0 && delta > 0 && samples[i]!.kneeAngle < 170) {
      start = i - 1;
      bottom = i;
      continue;
    }
    if (start >= 0 && samples[i]!.hipY > samples[bottom]!.hipY) bottom = i;
    if (
      start >= 0 &&
      bottom > start &&
      i > bottom &&
      samples[i]!.hipY <= samples[start]!.hipY + config.standingTolerance
    ) {
      const depth = samples[bottom]!.hipY - samples[start]!.hipY;
      const duration = samples[i]!.timestampMs - samples[start]!.timestampMs;
      if (depth >= config.minimumDepth && duration >= config.minimumDurationMs) {
        repetitions.push({
          startIndex: start,
          bottomIndex: bottom,
          endIndex: i,
          phases: samples.slice(start, i + 1).map((_, index) => {
            const absolute = start + index;
            if (absolute === start) return "standing";
            if (absolute < bottom) return "descent";
            if (absolute === bottom) return "bottom";
            if (absolute < i) return "ascent";
            return "standing_end";
          }),
        });
      }
      start = -1;
      bottom = -1;
    }
  }
  return repetitions;
}
