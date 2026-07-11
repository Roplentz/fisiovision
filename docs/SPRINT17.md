# Sprint 17 — Motor multimodelo e rigor biomecânico

## Entregas

- esqueleto canônico independente do estimador;
- mapeamentos MediaPipe 33, COCO 17 e OpenPose BODY_25;
- adaptador de resultados MMPose/COCO;
- filtro Butterworth de segunda ordem com opção zero-phase;
- controle de estabilidade dos comprimentos segmentares;
- confiança e incerteza por métrica;
- comparação pareada por MAE, RMSE, viés e limites de concordância;
- revisão formal de licenças;
- protocolo de experimento externo com Sports2D.

Nenhum código de Sports2D, Pose2Sim, FreeMoCap, OpenPose ou OpenCap foi copiado. O adapter MMPose recebe apenas um contrato de dados compatível com exportações COCO.

## Próxima validação

Executar MediaPipe e RTMPose sobre os mesmos vídeos autorizados, transformar ambos para o esqueleto canônico e comparar métricas por vista e qualidade. Sports2D será uma terceira referência externa, não ground truth clínico.
