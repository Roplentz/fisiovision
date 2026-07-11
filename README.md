# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.9.0

O Reviewer local fecha o ciclo técnico de validação:

1. extrai landmarks com MediaPipe;
2. executa o Motor Biomecânico;
3. recebe ground truth profissional;
4. compara status e repetições;
5. calcula erro absoluto por amostra;
6. classifica divergências;
7. gera relatório Markdown;
8. incorpora comparação e relatório ao pacote auditável.

## Executar

```bash
npx serve apps/reviewer
```

Divergências não são ocultadas nem bloqueadas: são registradas como evidência para calibração e validação.

## Limite clínico

O resultado automático é uma estimativa 2D para pesquisa e apoio à decisão. Exige confirmação profissional e não constitui diagnóstico. Consulte `docs/SPRINT9.md`.
