# Runbook de staging

## Pré-requisitos

1. Namespace e ingress configurados.
2. Secret `fisiovision-staging` com `redis-url`, `jwt-issuer`, `jwt-audience` e `jwks-url`.
3. ConfigMap `fisiovision-releases` contendo `releases.json`.
4. Imagem `ghcr.io/roplentz/fisiovision:staging`.
5. Prometheus Operator para aplicar as regras.

## Deploy

`kubectl apply -k deploy/staging`

Aguarde `/readyz` e execute os testes E2E com identidade de staging.

## Ensaio de rollback

1. Registre v1 e v2 como aprovadas.
2. Ative v1 e confirme checksum no PilatesVision.
3. Ative v2 e simule checksum inválido.
4. Confirme fallback imediato para v1 e incremento de `fisiovision_consumer_fallback_total`.
5. Execute rollback no Control.
6. Confirme novo manifesto primário v1, cadeia de auditoria válida e ausência de erros clínicos nos logs.
7. Registre evidências, operador, horário e motivo.

Não execute o ensaio com dados de pacientes.
