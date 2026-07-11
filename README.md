# FisioVision Engine

Motor clínico configurável de visão computacional e aprendizagem supervisionada do ecossistema **FisioHub**.

## Estado atual

Sprint 3 concluída em modo de pesquisa:

- gate de qualidade e resultados versionados;
- motor de protocolos e executor do agachamento;
- adaptador para 33 landmarks do MediaPipe Pose;
- pipeline ponta a ponta para análise de sequências;
- benchmark de aceitação, rejeição e contagem;
- testes sintéticos determinísticos no CI.

## Uso

```ts
import { analyzeMediaPipe } from "@fisiohub/fisiovision-engine";

const result = analyzeMediaPipe({
  protocolId: "squat",
  results: mediaPipeResults,
  fps: 30,
});
```

O adaptador aceita `landmarks` (Tasks Vision) e `poseLandmarks`, timestamps em milissegundos ou microssegundos e geração de timestamps pelo FPS.

## Princípios

1. Supervisão humana obrigatória.
2. Validação antes da promoção de modelos.
3. Separação entre assistência, pesquisa e treinamento.
4. Consentimento, minimização e rastreabilidade.
5. Confiança e motivos de rejeição em todas as análises.
6. Protocolos configuráveis, versionados e auditáveis.
7. Rollback obrigatório para modelos.
8. Nenhum dado do PilatesVision é compartilhado automaticamente.

## Protocolos planejados

- agachamento;
- sentar e levantar;
- abdução do ombro;
- abdução do quadril;
- avanço;
- mobilidade do tronco.

## Limite clínico

O baseline atual é sintético e não demonstra validade clínica. O FisioVision gera estimativas de apoio à decisão; resultados exigem confirmação profissional e não constituem diagnóstico. Consulte `docs/VALIDATION_SPRINT3.md`.
