# Sprint 4 — Dataset autorizado e benchmark em lote

## Fluxo

1. O vídeo autorizado é processado localmente por MediaPipe Pose.
2. Apenas o artefato JSON de landmarks é criado com `createLandmarkArtifact`.
3. O manifesto registra origem, licença/base legal, versão, split e ground truth.
4. `benchmarkDataset` executa somente o split solicitado.
5. O resultado é convertido em Markdown ou CSV para revisão.

## Proteções

- vídeos, landmarks e outputs permanecem ignorados pelo Git;
- manifestos não podem indicar mídia identificável versionada;
- caminhos absolutos e traversal (`..`) são rejeitados;
- cada amostra possui ID único;
- promoção clínica continua bloqueada até validação externa e governança.

O extrator de vídeo roda no ambiente consumidor que hospeda MediaPipe; o núcleo recebe os resultados sem incorporar binários, vídeos ou modelos ao pacote.
