# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.12.0

Aplicativos locais:

- `apps/reviewer`: gera amostras;
- `apps/validator`: consolida validação;
- `apps/registry`: avalia promoção;
- `apps/control`: ativa releases e executa rollback.

## Controle operacional

```bash
npx serve apps/control
```

Somente releases aprovadas podem gerar configuração de consumidor. Ativações e rollbacks exigem operador e motivo e entram numa cadeia SHA-256 assinada. O painel usa chave ECDSA P-256 privada não exportável; produção deve integrar KMS ou HSM.

Consulte `docs/SPRINT12.md`.
