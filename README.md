# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.5.0

- motor biomecânico e protocolo de agachamento;
- adaptador MediaPipe Pose;
- pipeline de análise e benchmark;
- manifestos auditáveis de datasets;
- ferramenta local para extração, revisão e empacotamento;
- ground truth aprovado com revisor e timestamp;
- pacote sem vídeo, nome de arquivo ou mídia identificável;
- relatórios de validação em Markdown e CSV.

## Ferramenta local

```ts
import { buildLocalValidationPackage } from "@fisiohub/fisiovision-engine";

const output = await buildLocalValidationPackage(metadata, [{
  video: { name: file.name, sizeBytes: file.size, type: file.type },
  extract: () => runMediaPipeLocally(file),
  exportOptions,
  groundTruth,
  reviewerId,
}]);
```

A aplicação consumidora controla a interface e executa MediaPipe no dispositivo. O motor recebe landmarks e gera somente arquivos JSON auditáveis.

## Governança

Todo dataset precisa declarar origem, licença ou acordo, consentimento/base legal, versão, split e ground truth. O baseline atual não demonstra validade clínica.

## Limite clínico

O FisioVision gera estimativas de apoio à decisão. Resultados exigem confirmação profissional e não constituem diagnóstico. Consulte `docs/SPRINT5.md`.
