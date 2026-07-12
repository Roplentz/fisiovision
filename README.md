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
