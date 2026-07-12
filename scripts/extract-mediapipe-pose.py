#!/usr/bin/env python3
import argparse,json,cv2,mediapipe as mp
p=argparse.ArgumentParser();p.add_argument("--video",required=True);p.add_argument("--output",required=True);p.add_argument("--sample-fps",type=float,default=5.0);a=p.parse_args()
cap=cv2.VideoCapture(a.video)
if not cap.isOpened(): raise RuntimeError("cannot open video")
source_fps=cap.get(cv2.CAP_PROP_FPS) or 30.0
step=max(1,round(source_fps/a.sample_fps));frames=[];index=0;detected=0
with mp.solutions.pose.Pose(static_image_mode=False,model_complexity=1,smooth_landmarks=True,min_detection_confidence=.5,min_tracking_confidence=.5) as pose:
 while True:
  ok,image=cap.read()
  if not ok: break
  if index%step==0:
   result=pose.process(cv2.cvtColor(image,cv2.COLOR_BGR2RGB))
   timestamp_ms=index*1000/source_fps
   if result.pose_landmarks:
    detected+=1;landmarks=[{"x":v.x,"y":v.y,"z":v.z,"visibility":v.visibility} for v in result.pose_landmarks.landmark]
   else:
    landmarks=[{"x":0,"y":0,"z":0,"visibility":0} for _ in range(33)]
   frames.append({"timestampMs":timestamp_ms,"landmarks":landmarks})
  index+=1
cap.release()
artifact={"schemaVersion":"fisiovision-open-pose-artifact-v0.1","sourceId":"wikimedia-pilates-hundred-2018","extractor":{"name":"MediaPipe Pose","version":mp.__version__,"modelComplexity":1},"sourceFps":source_fps,"sampleFps":a.sample_fps,"decodedFrames":index,"sampledFrames":len(frames),"detectedFrames":detected,"detectionRate":detected/len(frames) if frames else 0,"frames":frames}
with open(a.output,"w") as f: json.dump(artifact,f,separators=(",",":"))
print(json.dumps({k:artifact[k] for k in ["sourceId","sourceFps","sampleFps","decodedFrames","sampledFrames","detectedFrames","detectionRate"]}))
