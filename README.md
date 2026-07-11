# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.17.0

O motor agora possui base multimodelo e biomecânica mais rigorosa:

- esqueleto canônico;
- MediaPipe 33, COCO 17 e OpenPose BODY_25;
- adapter MMPose;
- filtro Butterworth;
- consistência de segmentos corporais;
- confiança e incerteza por métrica;
- MAE, RMSE, viés e limites de concordância;
- revisão formal de licenças;
- experimento planejado com Sports2D.

O MediaPipe continua como estimador web principal. RTMPose/MMPose será inicialmente um comparador offline, sem substituir uma release aprovada.

Consulte `docs/SPRINT17.md` e `research/THIRD_PARTY_REVIEW.md`.
