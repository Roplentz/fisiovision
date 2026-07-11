# Arquitetura do FisioVision Engine

## Regra central

O FisioVision é uma plataforma independente do PilatesVision. Produtos do FisioHub consomem o motor por contratos e APIs versionadas.

## Camadas

1. **Capture Quality** — resolução, enquadramento, visibilidade, orientação e condições de rejeição.
2. **Pose Estimation** — adaptadores para MediaPipe e futuros modelos.
3. **Signal Processing** — interpolação, suavização, normalização e rejeição de outliers.
4. **Movement Segmentation** — eventos, fases e repetições.
5. **Metrics** — ângulos, amplitudes, tempos, coordenação e simetria.
6. **Confidence** — confiança por frame, métrica, repetição e análise.
7. **Explainability** — justificativas, evidências e motivos estruturados de rejeição.
8. **Protocols** — regras clínicas configuráveis.
9. **Learning** — correções supervisionadas, calibração e modelos candidatos.
10. **Validation** — benchmarks internos e externos.
11. **Model Registry** — versão, dataset, desempenho, aprovação e rollback.
12. **API** — integração isolada com produtos consumidores.

## Fluxo

Vídeo → qualidade → pose → sinais → protocolo → segmentação → métricas → confiança → revisão profissional → feedback supervisionado.

## Separação de dados

- dados assistenciais não entram automaticamente em pesquisa;
- datasets externos permanecem fora do Git;
- vídeos licenciados para pesquisa não são redistribuídos;
- correções profissionais devem ser anonimizadas e versionadas;
- nenhum modelo aprende diretamente em produção.
