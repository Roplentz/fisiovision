import { aggregateConfidence } from "../confidence.js";
import { angleDegrees } from "../kinematics.js";
import { mean } from "../math.js";
import { assessQuality } from "../quality.js";
import type { EngineResult, MetricValue, PoseFrame } from "../types.js";
import type { BodySide } from "./pilates-shoulder-bridge.js";

export interface PilatesSideLegLiftOptions {
  movingSide?: BodySide;
  minimumAbductionDegrees?: number;
  returnToleranceDegrees?: number;
  minimumRepetitionDurationMs?: number;
}
const DISCLAIMER="Estimativa 2D do Pilates Side Leg Lift para pesquisa e apoio à decisão. Requer confirmação profissional e não constitui diagnóstico.";

export function runPilatesSideLegLiftProtocol(frames:readonly PoseFrame[],options:PilatesSideLegLiftOptions={},now=new Date()):EngineResult{
  const side=options.movingSide??"left";
  const indexes=side==="left"?{shoulder:11,hip:23,knee:25,ankle:27}:{shoulder:12,hip:24,knee:26,ankle:28};
  const quality=assessQuality(frames,{requiredLandmarkIndexes:Object.values(indexes),minimumVisibility:.5,minimumValidFrameRate:.7,minimumFrames:10});
  if(!quality.accepted)return result([],quality,0,now);
  const initial=frames[0]!,initialShoulder=initial.landmarks[indexes.shoulder]!,initialHip=initial.landmarks[indexes.hip]!;
  const torsoLength=Math.hypot(initialShoulder.x-initialHip.x,initialShoulder.y-initialHip.y);
  if(!Number.isFinite(torsoLength)||torsoLength<=0){quality.accepted=false;quality.reasons.push({code:"invalid_frame",message:"Comprimento aparente do tronco inválido."});return result([],quality,0,now)}
  const samples=frames.flatMap((frame)=>{
    const shoulder=frame.landmarks[indexes.shoulder],hip=frame.landmarks[indexes.hip],knee=frame.landmarks[indexes.knee],ankle=frame.landmarks[indexes.ankle];
    if(!shoulder||!hip||!knee||!ankle)return[];
    const hipAngle=angleDegrees(shoulder,hip,knee),kneeAngle=angleDegrees(hip,knee,ankle);
    if(hipAngle===null||kneeAngle===null)return[];
    return[{timestampMs:frame.timestampMs,abduction:Math.max(0,180-hipAngle),pelvicDrift:Math.abs(hip.y-initialHip.y)/torsoLength,kneeAngle}];
  });
  const minimum=options.minimumAbductionDegrees??10,tolerance=options.returnToleranceDegrees??4,minDuration=options.minimumRepetitionDurationMs??500;
  const reps:Array<{start:number;end:number}>=[];let start=-1;
  samples.forEach((sample,index)=>{if(start<0&&sample.abduction>=minimum)start=index;if(start>=0&&sample.abduction<=tolerance){if(sample.timestampMs-samples[start]!.timestampMs>=minDuration)reps.push({start,end:index});start=-1}});
  if(reps.length===0){quality.accepted=false;quality.reasons.push({code:"incomplete_cycle",message:"Nenhum ciclo completo de abdução e retorno foi detectado.",details:{maximumAbductionDegrees:Math.max(...samples.map((sample)=>sample.abduction)),minimumAbductionDegrees:minimum}});return result([],quality,0,now)}
  const confidence=aggregateConfidence(quality,samples.length/frames.length),abduction=samples.map((sample)=>sample.abduction),kneeAngles=samples.map((sample)=>sample.kneeAngle);
  const durations=reps.map((rep)=>(samples[rep.end]!.timestampMs-samples[rep.start]!.timestampMs)/1000);
  return result([
    metric("repetition_count",reps.length,"count",confidence),
    metric("side_leg_lift_abduction_peak",Math.max(...abduction),"deg",confidence),
    metric("side_leg_lift_abduction_range",Math.max(...abduction)-Math.min(...abduction),"deg",confidence),
    metric("side_leg_lift_pelvic_drift_max",Math.max(...samples.map((sample)=>sample.pelvicDrift)),"torso_ratio",confidence),
    metric("side_leg_lift_knee_angle_range",Math.max(...kneeAngles)-Math.min(...kneeAngles),"deg",confidence),
    metric("repetition_time",mean(durations),"s",confidence),
  ],quality,confidence,now);
}
function metric(id:string,value:number,unit:string,confidence:number):MetricValue{return{id,value:Number(value.toFixed(3)),unit,confidence}}
function result(metrics:MetricValue[],quality:ReturnType<typeof assessQuality>,confidence:number,now:Date):EngineResult{return{schemaVersion:"fisiovision-engine-v0.1",protocolId:"pilates-side-leg-lift",protocolVersion:"0.1.0",status:quality.accepted?"accepted":"rejected",quality,metrics,confidence,reasons:quality.reasons,generatedAt:now.toISOString(),disclaimer:DISCLAIMER}}
