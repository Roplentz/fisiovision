# Validação — Sprint 3

## Escopo entregue

A Sprint 3 fecha o caminho entre landmarks MediaPipe e o Motor de Agachamento:

1. normalização de 33 landmarks;
2. timestamps explícitos ou derivados de FPS;
3. análise ponta a ponta;
4. benchmark de aceitação/rejeição e contagem;
5. testes sintéticos determinísticos no CI.

## Baseline atual

O baseline automatizado é sintético e serve para verificar contrato, matemática e regressões. Ele não demonstra validade clínica nem desempenho em população real.

Critérios mínimos antes de qualquer uso assistencial:

- dataset externo licenciado e versionado;
- diversidade de biotipo, vestuário, câmera, iluminação e amplitude;
- ground truth revisado por profissionais;
- sensibilidade, especificidade, MAE de contagem e taxa de rejeição;
- análise estratificada e registro das falhas;
- aprovação de governança para promover o protocolo de `research`.

## Próxima execução real

Exportar landmarks MediaPipe dos vídeos autorizados para JSON, registrar o manifesto do dataset e alimentar os resultados em `evaluateBenchmark`. Vídeos e dados identificáveis permanecem fora do Git.
