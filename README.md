# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.13.0

A integração de consumidores agora oferece:

- contrato OpenAPI em `api/openapi.yaml`;
- manifesto de deployment com validade curta;
- release primária aprovada;
- fallback aprovado e diferente da primária;
- validação da identidade do consumidor;
- verificação SHA-256 do modelo;
- fallback automático em erro ou checksum inválido;
- interrupção segura quando nenhuma release é verificável.

## PilatesVision

O PilatesVision deve solicitar o manifesto autenticado, chamar `loadConsumerRelease` e inicializar o motor somente com o artefato verificado. JWT, TLS, autorização e rate limiting ficam na infraestrutura da API.

Consulte `docs/SPRINT13.md`.
