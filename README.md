# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.14.0

A API de integração agora é executável em Node 22:

- endpoint de deployment;
- JWT RS256 validado por JWKS;
- issuer, audience, exp e nbf;
- autorização pela claim `consumers`;
- rate limiting por sujeito e consumidor;
- request ID e logs JSON estruturados;
- somente releases aprovadas;
- fallback aprovado;
- nenhum token ou dado clínico nos logs.

## Executar a API

```bash
npm run build
FISIOVISION_RELEASES_FILE=./releases.json \
FISIOVISION_JWT_ISSUER=https://issuer.example \
FISIOVISION_JWT_AUDIENCE=fisiovision-api \
FISIOVISION_JWKS_URL=https://issuer.example/.well-known/jwks.json \
npm run start:api
```

Para produção distribuída, substitua o rate limiter em memória por Redis ou gateway equivalente. Consulte `docs/SPRINT14.md`.
