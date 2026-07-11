# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.16.0

Staging está preparado com:

- Kubernetes Deployment e Service;
- probes de saúde e readiness;
- security context restritivo;
- NetworkPolicy;
- alertas Prometheus;
- workflow manual protegido por ambiente;
- E2E com JWT RSA/JWKS real;
- ensaio API → PilatesVision → checksum → fallback;
- runbook de rollback completo.

## Validar

```bash
npm run test:e2e
kubectl apply -k deploy/staging
```

O deploy real exige o ambiente GitHub `staging`, `KUBECONFIG_BASE64`, secrets da aplicação e ConfigMap de releases. Consulte `docs/STAGING_RUNBOOK.md`.
