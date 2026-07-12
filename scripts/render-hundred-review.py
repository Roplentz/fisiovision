#!/usr/bin/env python3
import argparse,json,cv2,numpy as np
p=argparse.ArgumentParser();p.add_argument("--video",required=True);p.add_argument("--landmarks",required=True);p.add_argument("--output-video",required=True);p.add_argument("--output-contact-sheet",required=True);p.add_argument("--start-ms",type=float,required=True);p.add_argument("--end-ms",type=float,required=True);a=p.parse_args()
with open(a.landmarks) as f: artifact=json.load(f)
poses=artifact["frames"]; pose_times=np.array([x["timestampMs"] for x in poses])
clip=[x for x in poses if a.start_ms<=x["timestampMs"]<=a.end_ms]
def midpoint(lm,i,j): return ((lm[i]["x"]+lm[j]["x"])/2,(lm[i]["y"]+lm[j]["y"])/2)
positions=[]
for x in clip:
 lm=x["landmarks"];s=midpoint(lm,11,12);h=midpoint(lm,23,24);w=midpoint(lm,15,16);torso=max(1e-9,np.hypot(s[0]-h[0],s[1]-h[1]));positions.append((w[1]-s[1])/torso)
lo,hi=min(positions),max(positions);lower=lo+(hi-lo)*.35;upper=lo+(hi-lo)*.65
connections=[(7,11),(8,12),(11,12),(11,13),(13,15),(12,14),(14,16),(11,23),(12,24),(23,24),(23,25),(25,27),(24,26),(26,28)]
cap=cv2.VideoCapture(a.video);fps=cap.get(cv2.CAP_PROP_FPS) or 30;width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH));height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT));cap.set(cv2.CAP_PROP_POS_MSEC,a.start_ms)
writer=cv2.VideoWriter(a.output_video,cv2.VideoWriter_fourcc(*"mp4v"),fps,(width,height));state=None;transitions=0;shots=[];next_shot=a.start_ms
while True:
 ok,img=cap.read()
 if not ok: break
 t=cap.get(cv2.CAP_PROP_POS_MSEC)
 if t>a.end_ms: break
 idx=int(np.argmin(np.abs(pose_times-t)));entry=poses[idx];lm=entry["landmarks"]
 for u,v in connections:
  if lm[u]["visibility"]>=.5 and lm[v]["visibility"]>=.5:
   cv2.line(img,(int(lm[u]["x"]*width),int(lm[u]["y"]*height)),(int(lm[v]["x"]*width),int(lm[v]["y"]*height)),(0,220,255),3)
 for k in sorted(set(sum(([u,v] for u,v in connections),[]))):
  if lm[k]["visibility"]>=.5: cv2.circle(img,(int(lm[k]["x"]*width),int(lm[k]["y"]*height)),5,(0,255,80),-1)
 s=midpoint(lm,11,12);h=midpoint(lm,23,24);w=midpoint(lm,15,16);torso=max(1e-9,np.hypot(s[0]-h[0],s[1]-h[1]));pos=(w[1]-s[1])/torso;nxt="low" if pos<=lower else "high" if pos>=upper else None
 if nxt and state and nxt!=state: transitions+=1
 if nxt: state=nxt
 pumps=transitions//2
 cv2.rectangle(img,(18,18),(620,142),(5,15,30),-1);cv2.putText(img,f"The Hundred candidate {a.start_ms/1000:.0f}-{a.end_ms/1000:.0f}s",(35,52),cv2.FONT_HERSHEY_SIMPLEX,.8,(255,255,255),2);cv2.putText(img,f"t={(t-a.start_ms)/1000:.1f}s  state={state or 'transition'}  pumps={pumps}",(35,88),cv2.FONT_HERSHEY_SIMPLEX,.75,(0,220,255),2);cv2.putText(img,"Research overlay - clinical review required",(35,122),cv2.FONT_HERSHEY_SIMPLEX,.65,(140,220,255),2)
 writer.write(img)
 if t>=next_shot: shots.append(cv2.resize(img,(480,270)));next_shot+=2000
cap.release();writer.release()
if not shots: raise RuntimeError("no review frames generated")
cols=3;rows=(len(shots)+cols-1)//cols;sheet=np.zeros((rows*270,cols*480,3),dtype=np.uint8)
for n,shot in enumerate(shots): sheet[(n//cols)*270:(n//cols+1)*270,(n%cols)*480:(n%cols+1)*480]=shot
cv2.imwrite(a.output_contact_sheet,sheet)
print(json.dumps({"event":"review_overlay_created","startMs":a.start_ms,"endMs":a.end_ms,"frames":len(clip),"finalPumpCount":transitions//2,"contactFrames":len(shots),"outputVideo":a.output_video,"outputContactSheet":a.output_contact_sheet}))
