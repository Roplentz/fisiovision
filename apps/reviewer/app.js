import { FilesetResolver, PoseLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm";
import { analyzeSquatArtifact } from "./biomechanics.js";
import { compare, comparisonMarkdown } from "./comparison.js";

const video=document.querySelector("#video"),canvas=document.querySelector("#overlay"),ctx=canvas.getContext("2d");
const videoInput=document.querySelector("#videoInput"),landmarksInput=document.querySelector("#landmarksInput");
const runButton=document.querySelector("#runMediaPipe"),cancelButton=document.querySelector("#cancelMediaPipe");
const progress=document.querySelector("#progress"),status=document.querySelector("#status"),errors=document.querySelector("#errors"),empty=document.querySelector("#empty");
let artifact=null,engineResult=null,comparison=null,videoUrl=null,poseLandmarker=null,cancelled=false;
const FPS=15,MODEL="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const connections=[[11,12],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32]];

videoInput.addEventListener("change",()=>{const file=videoInput.files[0];if(!file)return;if(videoUrl)URL.revokeObjectURL(videoUrl);videoUrl=URL.createObjectURL(file);video.src=videoUrl;artifact=null;empty.hidden=true;runButton.disabled=true;status.textContent="Carregando vídeo local…";});
video.addEventListener("loadedmetadata",()=>{resize();runButton.disabled=false;status.textContent=`Pronto: ${formatDuration(video.duration)}`;});
landmarksInput.addEventListener("change",async()=>{try{const file=landmarksInput.files[0];if(!file)return;artifact=JSON.parse(await file.text());assertArtifact(artifact);status.textContent=`${artifact.frames.length} frames importados`;analyze();draw();}catch(error){showError(error);}});
runButton.addEventListener("click",runExtraction);
cancelButton.addEventListener("click",()=>{cancelled=true;status.textContent="Cancelando…";});
video.addEventListener("timeupdate",draw);window.addEventListener("resize",resize);

async function initPoseLandmarker(){
  if(poseLandmarker)return poseLandmarker;
  status.textContent="Baixando runtime e modelo MediaPipe…";
  const vision=await FilesetResolver.forVisionTasks(WASM);
  poseLandmarker=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MODEL,delegate:"GPU"},runningMode:"VIDEO",numPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5,outputSegmentationMasks:false});
  return poseLandmarker;
}

async function runExtraction(){
  errors.textContent="";cancelled=false;runButton.disabled=true;cancelButton.hidden=false;progress.hidden=false;
  try{
    const landmarker=await initPoseLandmarker();
    const total=Math.floor(video.duration*FPS)+1,frames=[];
    for(let index=0;index<total;index++){
      if(cancelled)throw new DOMException("Processamento cancelado.","AbortError");
      const timestampMs=Math.min(video.duration*1000,index*1000/FPS);
      await seek(timestampMs/1000);
      const result=landmarker.detectForVideo(video,timestampMs);
      const points=result.landmarks?.[0];
      if(points?.length===33)frames.push({timestampMs,landmarks:points.map(({x,y,z,visibility})=>({x,y,z,visibility}))});
      progress.value=(index+1)/total;status.textContent=`Processando ${index+1}/${total} · ${Math.round(progress.value*100)}%`;
      await new Promise(requestAnimationFrame);
    }
    if(frames.length===0)throw new Error("Nenhuma pose foi detectada. Verifique enquadramento e iluminação.");
    artifact={schemaVersion:"fisiovision-landmarks-v0.1",sourceId:value("sampleId")||"local-sample",fps:FPS,frames,extractor:{name:"MediaPipe Pose",version:"tasks-vision@latest",model:"pose_landmarker_lite"}};
    status.textContent=`Concluído: ${frames.length}/${total} frames com pose`;analyze();video.currentTime=0;draw();
  }catch(error){if(error.name==="AbortError")status.textContent="Processamento cancelado";else showError(error);}
  finally{runButton.disabled=false;cancelButton.hidden=true;progress.hidden=true;}
}

function seek(seconds){return new Promise((resolve,reject)=>{const done=()=>{cleanup();resolve()};const fail=()=>{cleanup();reject(new Error("Falha ao acessar frame do vídeo."))};const cleanup=()=>{video.removeEventListener("seeked",done);video.removeEventListener("error",fail)};video.addEventListener("seeked",done,{once:true});video.addEventListener("error",fail,{once:true});if(Math.abs(video.currentTime-seconds)<.001){cleanup();resolve();return}video.currentTime=seconds;});}
function resize(){canvas.width=video.clientWidth*devicePixelRatio;canvas.height=video.clientHeight*devicePixelRatio;draw();}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);if(!artifact?.frames.length)return;const target=video.currentTime*1000;const frame=artifact.frames.reduce((best,current)=>Math.abs(current.timestampMs-target)<Math.abs(best.timestampMs-target)?current:best);const points=frame.landmarks;if(!points)return;ctx.strokeStyle="#4ee0a0";ctx.lineWidth=3*devicePixelRatio;ctx.fillStyle="#ecfff7";for(const [a,b] of connections){const p=points[a],q=points[b];if(!p||!q||(p.visibility??1)<.5||(q.visibility??1)<.5)continue;ctx.beginPath();ctx.moveTo(p.x*canvas.width,p.y*canvas.height);ctx.lineTo(q.x*canvas.width,q.y*canvas.height);ctx.stroke();}for(const p of points){if((p.visibility??1)<.5)continue;ctx.beginPath();ctx.arc(p.x*canvas.width,p.y*canvas.height,3.5*devicePixelRatio,0,Math.PI*2);ctx.fill();}}
document.querySelector("#approve").addEventListener("click",()=>{errors.textContent="";try{assertArtifact(artifact);const sampleId=value("sampleId"),reviewerId=value("reviewerId"),legalBasis=value("legalBasis"),expectedStatus=value("expectedStatus");if(!sampleId||!reviewerId||!legalBasis)throw new Error("ID da amostra, revisor e base legal são obrigatórios.");const repetitions=Number(value("repetitions"));if(expectedStatus==="accepted"&&(!Number.isInteger(repetitions)||repetitions<0))throw new Error("Informe uma contagem válida.");const now=new Date().toISOString();const manifest={schemaVersion:"fisiovision-dataset-v0.1",id:"local-review",version:"0.1.0",title:"Revisão local",source:"local-authorized",license:"proprietary-consented",consentOrLegalBasis:legalBasis,containsIdentifiableMedia:false,createdAt:now,samples:[{id:sampleId,landmarksFile:`landmarks/${sampleId}.json`,protocolId:value("protocol"),expectedStatus,...(expectedStatus==="accepted"?{expectedRepetitions:repetitions}:{}),split:value("split")}]};refreshComparison();const report=comparisonMarkdown(sampleId,comparison);const bundle={schemaVersion:"fisiovision-validation-package-v0.1",generatedAt:now,engineResult,comparison,reports:{"comparison.md":report},review:{reviewerId,notes:value("notes"),decision:"approved",reviewedAt:now},manifest,artifacts:{[`landmarks/${sampleId}.json`]:artifact}};download(`fisiovision-${sampleId}.json`,JSON.stringify(bundle,null,2));status.textContent="Pacote gerado localmente";}catch(error){showError(error);}});
function analyze(){engineResult=analyzeSquatArtifact(artifact);const panel=document.querySelector("#analysis");panel.hidden=false;const accepted=engineResult.status==="accepted";const statusNode=document.querySelector("#analysisStatus");statusNode.textContent=accepted?"Análise aceita":"Análise rejeitada";statusNode.className=accepted?"accepted":"rejected";document.querySelector("#confidence").textContent=`${Math.round(engineResult.confidence*100)}% confiança`;document.querySelector("#quality").innerHTML=`<span>Frames válidos <b>${Math.round(engineResult.quality.validFrameRate*100)}%</b></span><span>Visibilidade <b>${Math.round(engineResult.quality.meanVisibility*100)}%</b></span>`;const labels={repetition_count:"Repetições",repetition_time:"Tempo médio",knee_flexion_range_left:"Joelho esquerdo",knee_flexion_range_right:"Joelho direito",trunk_inclination_p95:"Inclinação do tronco"};document.querySelector("#metrics").innerHTML=engineResult.metrics.map(m=>`<article><span>${labels[m.id]??m.id}</span><strong>${formatMetric(m)}</strong></article>`).join("");const reasons=document.querySelector("#reasons");reasons.innerHTML=engineResult.reasons.map(r=>`<li>${escapeHtml(r.message)}</li>`).join("");reasons.hidden=!engineResult.reasons.length;refreshComparison();}
function formatMetric(m){if(m.unit==="count")return String(Math.round(m.value));if(m.unit==="s")return m.value.toFixed(2)+" s";if(m.unit==="deg")return m.value.toFixed(1)+"°";return m.value.toFixed(3)+" "+m.unit}
function escapeHtml(value){const node=document.createElement("span");node.textContent=value;return node.innerHTML}
function refreshComparison(){if(!engineResult)return;const expectedStatus=value("expectedStatus"),raw=Number(value("repetitions"));comparison=compare(engineResult,expectedStatus,Number.isInteger(raw)&&raw>=0?raw:null);const panel=document.querySelector("#comparison");panel.hidden=false;const labels={match:"Concordância total",status_mismatch:"Divergência de status",count_mismatch:"Divergência de contagem",not_comparable:"Não comparável"};const title=document.querySelector("#comparisonTitle");title.textContent=labels[comparison.outcome];title.className=comparison.outcome==="match"?"accepted":"rejected";const show=v=>v===null?"n/a":String(v);document.querySelector("#comparisonGrid").innerHTML=`<span>Status automático <b>${comparison.automaticStatus}</b></span><span>Status esperado <b>${comparison.expectedStatus}</b></span><span>Contagem automática <b>${show(comparison.automaticRepetitions)}</b></span><span>Contagem esperada <b>${show(comparison.expectedRepetitions)}</b></span><span>Erro absoluto <b>${show(comparison.repetitionAbsoluteError)}</b></span>`;}
for(const id of ["expectedStatus","repetitions","sampleId"])document.querySelector("#"+id).addEventListener("input",refreshComparison);
document.querySelector("#downloadReport").addEventListener("click",()=>{if(!comparison)return;download(`fisiovision-${value("sampleId")||"sample"}-comparacao.md`,comparisonMarkdown(value("sampleId")||"sample",comparison),"text/markdown");});
function assertArtifact(data){if(!data||data.schemaVersion!=="fisiovision-landmarks-v0.1"||!Array.isArray(data.frames)||data.frames.length===0)throw new Error("Execute o MediaPipe ou importe landmarks válidos.");}
function value(id){return document.querySelector("#"+id).value.trim()}function showError(error){errors.textContent=error instanceof Error?error.message:String(error)}function formatDuration(s){return `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,"0")}`}function download(name,text,type="application/json"){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
window.addEventListener("beforeunload",()=>{if(videoUrl)URL.revokeObjectURL(videoUrl);poseLandmarker?.close?.()});
