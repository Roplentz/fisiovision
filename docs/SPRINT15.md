# Sprint 15 — Operação e segurança

## Entregas

- imagem multi-stage Node 22 Alpine;
- processo não-root, filesystem read-only e no-new-privileges;
- healthcheck;
- cache JWKS com TTL e deduplicação de requisições;
- rate limiting Redis;
- métricas Prometheus;
- auditoria de dependências, testes e build do container no GitHub Actions.

## Endpoints operacionais

- `/healthz`: processo ativo;
- `/readyz`: releases carregadas e JWKS disponível;
- `/metrics`: métricas Prometheus sem labels sensíveis.

Redis usa janela fixa distribuída. Em desenvolvimento, a API pode continuar com o limitador em memória. Produção deve restringir `/metrics` à rede de observabilidade e usar Redis com autenticação/TLS quando sair da rede privada.
