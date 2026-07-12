# Sprint 18 — Benchmark multimodelo

A Sprint 18 entrega o pipeline reproduzível para comparar MediaPipe, RTMPose e Sports2D sobre os mesmos vídeos.

## Métricas

- frames pareados por tolerância temporal;
- cobertura de cada série;
- erro médio de timestamp;
- MAE;
- RMSE;
- viés;
- limites de concordância de 95%.

## Execução

Cada estimador deve exportar séries normalizadas em JSON. Em seguida:

`npm run build`

`npm run benchmark:multimodel -- research/experiments/multimodel/manifest.json`

O comando gera JSON, Markdown e CSV. Dados, vídeos e outputs permanecem fora do Git.

Nenhum resultado real foi declarado nesta sprint porque não foram fornecidos vídeos autorizados e saídas dos três estimadores. Testes sintéticos validam apenas o pipeline.
