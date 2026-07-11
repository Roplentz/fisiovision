# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual

Sprint 4 concluída em modo de pesquisa:

- motor biomecânico e protocolo de agachamento;
- adaptador MediaPipe Pose e pipeline ponta a ponta;
- artefato versionado de landmarks;
- manifesto auditável de datasets autorizados;
- benchmark em lote por split;
- relatórios automáticos em Markdown e CSV;
- proteções contra mídia identificável e caminhos inseguros.

## Fluxo básico

```ts
import {
  createLandmarkArtifact,
  benchmarkDataset,
  benchmarkReportToMarkdown,
} from "@fisiohub/fisiovision-engine";
```

O vídeo é processado localmente pelo ambiente que hospeda MediaPipe. O repositório recebe apenas código e manifestos não identificáveis; vídeos, landmarks brutos e outputs permanecem fora do Git.

## Governança

Todo dataset precisa declarar origem, licença ou acordo, consentimento/base legal, versão, split e ground truth. O baseline atual não demonstra validade clínica.

## Protocolos planejados

- agachamento;
- sentar e levantar;
- abdução do ombro;
- abdução do quadril;
- avanço;
- mobilidade do tronco.

## Limite clínico

O FisioVision gera estimativas de apoio à decisão. Resultados exigem confirmação profissional e não constituem diagnóstico. Consulte `docs/SPRINT4.md`.
