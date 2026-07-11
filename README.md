# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.10.0

O projeto possui dois aplicativos locais:

- `apps/reviewer`: vídeo → MediaPipe → Motor Biomecânico → ground truth → pacote;
- `apps/validator`: múltiplos pacotes → métricas consolidadas → relatórios.

## Executar

```bash
npx serve apps/reviewer
npx serve apps/validator
```

O Validator calcula matriz de confusão, acurácia, sensibilidade, especificidade, MAE de repetições, taxa de rejeição e listas de divergências. Exporta Markdown, CSV e JSON.

Todos os arquivos permanecem no navegador e não são enviados.

## Limite clínico

Os resultados são evidências técnicas de pesquisa, não validação clínica isolada. Exigem revisão profissional e não constituem diagnóstico. Consulte `docs/SPRINT10.md`.
