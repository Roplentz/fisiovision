# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Dataset público inicial

Selecionamos o **Keraal Low Back Pain Physical Rehabilitation Dataset** para o primeiro benchmark público de pesquisa.

Ele contém vídeos anonimizados, BlazePose, OpenPose, Kinect/Vicon e anotações médicas. A licença é **CC-BY-NC-SA**, portanto:

- uso exclusivo em pesquisa e benchmark;
- proibido como treinamento de modelo comercial;
- conteúdo não será versionado ou redistribuído;
- resultados não promovem automaticamente uma release comercial.

## Baixar a amostra

```bash
npm run dataset:keraal -- --accept-noncommercial
```

O comando registra URL, data, tamanho, SHA-256, licença aceita e finalidade. Os arquivos ficam em `data/public/keraal`, ignorados pelo Git.

Consulte `research/datasets/public/README.md`.

## Primeiro resultado público

A amostra Keraal produziu 10 pares BlazePose/OpenPose e 2.444 frames pareados. A concordância angular preliminar foi insuficiente para considerar os estimadores intercambiáveis: MAE de 22–23° nos cotovelos e aproximadamente 28° nos ombros. Consulte `research/reports/KERAAL_SAMPLE_PRELIMINARY_2026-07-12.md`.

## Resultado filtrado

A estratificação Keraal mostrou forte dependência do exercício: CTK correto apresentou MAE de 7–10°, enquanto ELK apresentou cerca de 42° nos cotovelos e 110° nos ombros. Isso exige suitability por vista/protocolo e rejeição de ângulos 2D geometricamente ambíguos. Consulte `research/reports/KERAAL_FILTERED_STRATIFIED_2026-07-12.md`.
