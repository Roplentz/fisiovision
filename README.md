# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.18.0

O benchmark multimodelo está pronto para comparar:

- MediaPipe;
- RTMPose/MMPose;
- Sports2D.

O pipeline alinha frames por timestamp e calcula cobertura, erro temporal, MAE, RMSE, viés e limites de concordância de 95%. Gera relatórios JSON, Markdown e CSV.

## Executar

```bash
npm run build
npm run benchmark:multimodel -- research/experiments/multimodel/manifest.example.json
```

O exemplo deve ser copiado e apontado para outputs locais reais. Vídeos, landmarks e resultados permanecem fora do Git.

A Sprint 18 não declara desempenho real: ainda precisamos processar os mesmos vídeos autorizados nos três estimadores. Consulte `docs/SPRINT18.md`.
