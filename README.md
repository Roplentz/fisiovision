# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.7.0

O Reviewer local agora executa MediaPipe Pose diretamente no navegador:

- seleção de vídeo autorizado;
- Pose Landmarker em modo VIDEO;
- amostragem controlada em 15 FPS;
- progresso e cancelamento;
- geração automática dos landmarks;
- visualização sincronizada do esqueleto;
- revisão profissional e download do pacote;
- importação manual de JSON mantida como contingência.

## Executar

```bash
npx serve apps/reviewer
```

Na primeira execução, o navegador baixa o runtime WASM e o modelo Pose Landmarker Lite. O vídeo permanece local e não é enviado.

## Limite clínico

O baseline atual não demonstra validade clínica. Resultados exigem confirmação profissional e não constituem diagnóstico. Consulte `docs/SPRINT7.md`.
