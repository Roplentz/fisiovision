const REQUIRED=[11,12,23,24,25,26,27,28];
const disclaimer="Estimativa 2D para apoio à decisão. Requer confirmação profissional e não constitui diagnóstico.";

export function analyzeSquatArtifact(artifact){
  const frames=artifact?.frames??[],valid=frames.filter(frame=>REQUIRED.every(index=>{const p=frame.landmarks?.[index];return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??0)>=.5}));
  const validFrameRate=frames.length?valid.length/frames.length:0;
  const visibility=valid.flatMap(frame=>REQUIRED.map(index=>frame.landmarks[index].visibility??0));
  const quality={accepted:frames.length>=10&&validFrameRate>=.7,totalFrames:frames.length,validFrames:valid.length,validFrameRate,meanVisibility:mean(visibility),reasons:[]};
  if(frames.length<10)quality.reasons.push({code:"insufficient_landmarks",message:"Quantidade de frames insuficiente para análise confiável."});
  if(validFrameRate<.7)quality.reasons.push({code:"low_visibility",message:"Taxa de frames válidos abaixo do mínimo do protocolo."});
  if(!quality.accepted)return result([],quality,0);

  const samples=[],left=[],right=[],trunk=[];
  for(const frame of valid){const p=frame.landmarks,hip=mid(p[23],p[24]),shoulder=mid(p[11],p[12]),l=angle(p[23],p[25],p[27]),r=angle(p[24],p[26],p[28]);if(l===null||r===null)continue;samples.push({timestampMs:frame.timestampMs,hipY:hip.y,kneeAngle:(l+r)/2});left.push(l);right.push(r);trunk.push(inclination(shoulder,hip));}
  const reps=segment(samples);
  if(!reps.length){quality.accepted=false;quality.reasons.push({code:"incomplete_cycle",message:"Nenhuma repetição completa foi detectada."});return result([],quality,0);}
  const durations=reps.map(rep=>(samples[rep.end].timestampMs-samples[rep.start].timestampMs)/1000);
  const confidence=clamp(validFrameRate*.45+quality.meanVisibility*.4+(reps.length/(reps.length+1))*.15);
  return result([
    metric("repetition_count",reps.length,"count",confidence),
    metric("repetition_time",mean(durations),"s",confidence),
    metric("knee_flexion_range_left",Math.max(...left)-Math.min(...left),"deg",confidence),
    metric("knee_flexion_range_right",Math.max(...right)-Math.min(...right),"deg",confidence),
    metric("trunk_inclination_p95",percentile(trunk,.95),"deg",confidence),
  ],quality,confidence);
}
function segment(samples){const reps=[];let start=-1,bottom=-1;for(let i=1;i<samples.length;i++){const delta=samples[i].hipY-samples[i-1].hipY;if(start<0&&delta>0&&samples[i].kneeAngle<170){start=i-1;bottom=i;continue}if(start>=0&&samples[i].hipY>samples[bottom].hipY)bottom=i;if(start>=0&&bottom>start&&i>bottom&&samples[i].hipY<=samples[start].hipY+.035){if(samples[bottom].hipY-samples[start].hipY>=.08&&samples[i].timestampMs-samples[start].timestampMs>=500)reps.push({start,bottom,end:i});start=-1;bottom=-1;}}return reps}
function angle(a,b,c){const ux=a.x-b.x,uy=a.y-b.y,vx=c.x-b.x,vy=c.y-b.y,d=Math.hypot(ux,uy)*Math.hypot(vx,vy);return d?Math.acos(clamp((ux*vx+uy*vy)/d,-1,1))*180/Math.PI:null}
function inclination(a,b){return Math.atan2(Math.abs(a.x-b.x),Math.abs(a.y-b.y))*180/Math.PI}
function mid(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
function metric(id,value,unit,confidence){return{id,value:Number(value.toFixed(3)),unit,confidence}}
function result(metrics,quality,confidence){return{schemaVersion:"fisiovision-engine-v0.1",protocolId:"squat",protocolVersion:"0.1.0",status:quality.accepted?"accepted":"rejected",quality,metrics,confidence:Number(confidence.toFixed(3)),reasons:quality.reasons,generatedAt:new Date().toISOString(),disclaimer}}
function mean(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0}function clamp(v,min=0,max=1){return Math.min(max,Math.max(min,v))}function percentile(values,p){const sorted=[...values].sort((a,b)=>a-b),i=(sorted.length-1)*p,l=Math.floor(i),u=Math.ceil(i);return sorted[l]*(1-(i-l))+sorted[u]*(i-l)}
