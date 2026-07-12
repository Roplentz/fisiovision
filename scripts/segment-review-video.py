#!/usr/bin/env python3
import argparse,cv2,json,hashlib,os,math,numpy as np
p=argparse.ArgumentParser();p.add_argument("--video",required=True);p.add_argument("--output-dir",required=True);p.add_argument("--segment-seconds",type=int,default=30);a=p.parse_args()
os.makedirs(a.output_dir,exist_ok=True);cap=cv2.VideoCapture(a.video)
if not cap.isOpened(): raise RuntimeError("cannot open source video")
source_fps=cap.get(cv2.CAP_PROP_FPS) or 30;total_frames=int(cap.get(cv2.CAP_PROP_FRAME_COUNT));duration=total_frames/source_fps;target_fps=15;step=max(1,round(source_fps/target_fps));width,height=960,540
writers={};thumbs={};counts={};frame_index=0
while True:
 ok,img=cap.read()
 if not ok: break
 if frame_index%step:
  frame_index+=1;continue
 t=frame_index/source_fps;segment=int(t//a.segment_seconds);start=segment*a.segment_seconds;end=min((segment+1)*a.segment_seconds,duration)
 if segment not in writers:
  path=os.path.join(a.output_dir,f"segment-{segment+1:02d}-{int(start):04d}-{int(math.ceil(end)):04d}s.mp4")
  writers[segment]=[cv2.VideoWriter(path,cv2.VideoWriter_fourcc(*"mp4v"),target_fps,(width,height)),path]
  thumbs[segment]=cv2.resize(img,(480,270));counts[segment]=0
 out=cv2.resize(img,(width,height));cv2.rectangle(out,(0,0),(width,72),(5,15,30),-1);cv2.putText(out,f"Segment {segment+1:02d} | {start/60:.1f}-{end/60:.1f} min",(24,46),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2);writers[segment][0].write(out);counts[segment]+=1;frame_index+=1
cap.release()
for writer,_ in writers.values(): writer.release()
records=[]
for segment,(writer,path) in sorted(writers.items()):
 with open(path,"rb") as f: sha=hashlib.sha256(f.read()).hexdigest()
 start=segment*a.segment_seconds;end=min((segment+1)*a.segment_seconds,duration);records.append({"segment":segment+1,"startSeconds":round(start,3),"endSeconds":round(end,3),"file":os.path.basename(path),"frames":counts[segment],"sha256":"sha256:"+sha,"bytes":os.path.getsize(path)})
 thumb=thumbs[segment];cv2.rectangle(thumb,(0,0),(480,54),(5,15,30),-1);cv2.putText(thumb,f"{segment+1:02d} | {start//60:02.0f}:{start%60:02.0f}-{end//60:02.0f}:{end%60:02.0f}",(12,36),cv2.FONT_HERSHEY_SIMPLEX,.8,(255,255,255),2)
cols=4;rows=math.ceil(len(thumbs)/cols);sheet=np.zeros((rows*270,cols*480,3),dtype=np.uint8)
for n,segment in enumerate(sorted(thumbs)): sheet[(n//cols)*270:(n//cols+1)*270,(n%cols)*480:(n%cols+1)*480]=thumbs[segment]
sheet_path=os.path.join(a.output_dir,"contact-sheet-all-segments.jpg");cv2.imwrite(sheet_path,sheet,[cv2.IMWRITE_JPEG_QUALITY,90])
index={"schemaVersion":"fisiovision-review-segments-v0.1","sourceId":"wikimedia-pilates-hundred-2018","sourceDurationSeconds":duration,"sourceFps":source_fps,"targetFps":target_fps,"segmentSeconds":a.segment_seconds,"segments":records,"contactSheet":os.path.basename(sheet_path)}
with open(os.path.join(a.output_dir,"segments.json"),"w") as f:json.dump(index,f,indent=2)
print(json.dumps({"event":"review_segments_created","sourceDurationSeconds":duration,"segments":len(records),"contactSheet":sheet_path,"totalBytes":sum(x["bytes"] for x in records)}))
