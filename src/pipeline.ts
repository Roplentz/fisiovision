import { mediaPipeSequenceToFrames, type MediaPipeAdapterOptions, type MediaPipePoseResult } from "./adapters/mediapipe.js";
import { runSquatProtocol } from "./protocols/squat.js";
import type { EngineResult, PoseFrame } from "./types.js";

export type SupportedProtocolId = "squat";

export interface AnalysisRequest {
  protocolId: SupportedProtocolId;
  frames: readonly PoseFrame[];
  generatedAt?: Date;
}

export interface MediaPipeAnalysisRequest {
  protocolId: SupportedProtocolId;
  results: readonly MediaPipePoseResult[];
  fps?: number;
  adapter?: MediaPipeAdapterOptions;
  generatedAt?: Date;
}

export function analyzeFrames(request: AnalysisRequest): EngineResult {
  switch (request.protocolId) {
    case "squat":
      return runSquatProtocol(request.frames, request.generatedAt);
  }
}

export function analyzeMediaPipe(request: MediaPipeAnalysisRequest): EngineResult {
  return analyzeFrames({
    protocolId: request.protocolId,
    frames: mediaPipeSequenceToFrames(request.results, request.fps ?? 30, request.adapter),
    ...(request.generatedAt ? { generatedAt: request.generatedAt } : {}),
  });
}
