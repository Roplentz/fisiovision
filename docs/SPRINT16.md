# Sprint 16 — Staging e E2E

A Sprint entrega manifests Kubernetes restritivos, testes E2E com RSA/JWKS reais, regras Prometheus e runbook de rollback completo.

O teste automatizado sobe a API em porta efêmera, assina JWT RS256, valida pelo JWKS, solicita deployment aprovado e simula falha de checksum da primária. O SDK consumidor confirma fallback para a versão anterior.

O deployment real não é executado pelo repositório: requer os secrets e o cluster autorizados. Use `docs/STAGING_RUNBOOK.md`.
