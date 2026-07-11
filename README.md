# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.15.0

A camada operacional inclui:

- container multi-stage Node 22 Alpine;
- usuário não-root e filesystem read-only;
- `/healthz`, `/readyz` e `/metrics`;
- cache JWKS com TTL;
- rate limiting distribuído com Redis;
- métricas Prometheus;
- logs estruturados;
- pipeline semanal de segurança;
- build automatizado do container.

## Executar

```bash
docker compose up --build
```

O ambiente deve fornecer issuer, audience e JWKS. O arquivo `releases.json` é montado somente para leitura. Consulte `docs/SPRINT15.md`.
