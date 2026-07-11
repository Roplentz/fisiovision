# Datasets de validação

Dados brutos, vídeos e landmarks não são versionados neste repositório.

Cada conjunto deve possuir um manifesto com origem, licença, consentimento ou base legal, finalidade permitida, versão e checksum. Apenas material aberto com licença verificável ou material próprio consentido pode entrar na validação.

## Contrato de entrada MediaPipe

O adaptador aceita sequências JSON com 33 landmarks por frame nos formatos:

- `landmarks` (MediaPipe Tasks Vision);
- `poseLandmarks` (compatibilidade com integrações anteriores);
- timestamps em milissegundos ou microssegundos;
- coordenadas normalizadas com visibilidade ou presença.

Nenhuma imagem identificável deve ser adicionada ao Git.
