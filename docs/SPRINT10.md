# Sprint 10 — Validação consolidada

A Sprint 10 adiciona agregação de múltiplas amostras e um aplicativo local em `apps/validator`.

## Métricas

- matriz de confusão;
- acurácia;
- sensibilidade para amostras esperadas como aceitas;
- especificidade para amostras esperadas como rejeitadas;
- MAE da contagem;
- taxa de rejeição automática;
- listas de divergências de status e contagem.

Denominadores ausentes são apresentados como `n/a`, evitando métricas artificiais. Os relatórios podem ser exportados em Markdown, CSV e JSON.
