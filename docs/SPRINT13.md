# Sprint 13 — Integração segura com consumidores

## Fluxo

1. O consumidor autenticado solicita um deployment de curta duração.
2. A API busca somente uma release aprovada e, quando disponível, um fallback aprovado.
3. O PilatesVision valida identidade do consumidor, validade e protocolo.
4. O artefato primário é carregado e verificado por SHA-256.
5. Falha de carregamento ou checksum aciona o fallback.
6. Falha também no fallback interrompe a inicialização; nunca se usa modelo não verificado.

O contrato HTTP está em `api/openapi.yaml`. Autenticação JWT, autorização do consumidor, rate limiting e TLS pertencem à camada de infraestrutura. O núcleo não contém segredos.
