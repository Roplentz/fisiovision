# Sprint 5 — Ferramenta local de validação

## Objetivo

Transformar vídeos selecionados localmente em um pacote auditável de validação sem incluir ou enviar o vídeo original.

## Fluxo implementado

1. O consumidor seleciona um arquivo local.
2. A função `extract` fornecida pelo ambiente executa MediaPipe no dispositivo.
3. `createLandmarkArtifact` normaliza o resultado.
4. O profissional revisa contagem, aceite/rejeição e split.
5. A aprovação registra revisor e horário.
6. O pacote gera `manifest.json`, metadados e arquivos JSON de landmarks.

## Responsabilidade do consumidor

A interface visual e a inicialização do MediaPipe pertencem ao aplicativo local/web que usa o motor. O FisioVision não recebe upload, URL ou bytes do vídeo e não inclui dependência pesada de inferência no núcleo.

## Segurança

- arquivo não-vídeo ou vazio é recusado;
- ground truth sem aprovação rastreável é recusado;
- IDs duplicados são recusados;
- o nome do vídeo não entra no pacote;
- nenhum arquivo de vídeo é serializado;
- consentimento ou base legal continua obrigatório.
