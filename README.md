# FisioVision Engine

Motor clínico configurável de visão computacional e aprendizagem supervisionada do ecossistema **FisioHub**.

## Propósito

Transformar vídeos de tarefas funcionais e exercícios em indicadores objetivos, explicáveis e versionados de apoio à decisão profissional, sem substituir a avaliação clínica ou emitir diagnóstico autônomo.

## Posicionamento

- **Ecossistema:** FisioHub
- **Plataforma:** FisioVision Engine
- **Primeiro consumidor futuro:** PilatesVision
- **Arquitetura:** independente, API-first
- **Estado:** fundação técnica / pesquisa

## Princípios

1. Supervisão humana obrigatória.
2. Validação antes da promoção de modelos.
3. Separação entre assistência, pesquisa e treinamento.
4. Consentimento, minimização e rastreabilidade.
5. Confiança e motivos de rejeição em todas as análises.
6. Protocolos configuráveis, versionados e auditáveis.
7. Rollback obrigatório para modelos.
8. Nenhum dado do PilatesVision é compartilhado automaticamente.

## Estrutura planejada

```text
engine/       processamento comum de visão e sinais
protocols/    protocolos clínicos configuráveis
learning/     aprendizagem supervisionada e calibração
validation/   datasets, benchmarks e relatórios
model-registry/ versões, desempenho e governança de modelos
api/          integração com produtos consumidores
tests/        testes matemáticos, clínicos e de contratos
docs/         arquitetura, decisões e governança
```

## Protocolos iniciais

- agachamento;
- sentar e levantar;
- abdução do ombro;
- abdução do quadril;
- avanço;
- mobilidade do tronco.

## Limite clínico

O FisioVision gera estimativas e indicadores de apoio à decisão. Resultados automáticos exigem confirmação profissional e não constituem diagnóstico.
