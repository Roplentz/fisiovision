# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.8.0

O Reviewer local agora completa o fluxo de análise:

1. seleciona vídeo autorizado;
2. executa MediaPipe no navegador;
3. gera landmarks;
4. executa o Motor Biomecânico de agachamento;
5. apresenta confiança, qualidade, métricas e rejeições;
6. coleta revisão profissional;
7. baixa o pacote com o resultado versionado.

## Executar

```bash
npx serve apps/reviewer
```

O painel mostra repetições, tempo médio, amplitude aparente dos joelhos, inclinação do tronco, frames válidos e visibilidade. Resultados rejeitados apresentam o motivo explícito.

## Limite clínico

As métricas são estimativas 2D para pesquisa e apoio à decisão. Exigem confirmação profissional e não constituem diagnóstico. Consulte `docs/SPRINT8.md`.
