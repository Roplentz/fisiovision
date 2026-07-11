# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.11.0

Aplicativos locais:

- `apps/reviewer`: gera amostras validadas;
- `apps/validator`: consolida métricas do dataset;
- `apps/registry`: compara releases e avalia promoção.

## Release Gate

```bash
npx serve apps/registry
```

Cada release registra versões do motor, protocolo e modelo, checksum, estado e relatório de validação. A política técnica exige mínimos de amostras, acurácia, sensibilidade e especificidade, limites de MAE e rejeição e ausência de regressões.

Uma release tecnicamente elegível ainda requer aprovação profissional e plano de rollback. Consulte `docs/SPRINT11.md`.
