# Governança de aprendizagem

## Regra

O modelo de produção nunca é atualizado diretamente com dados de uso cotidiano.

## Ciclo controlado

1. Coleta autorizada e minimizada.
2. Anonimização e separação do ambiente assistencial.
3. Revisão da qualidade dos rótulos.
4. Divisão por participante, evitando vazamento.
5. Treinamento de modelo candidato.
6. Validação interna.
7. Validação externa.
8. Avaliação de subgrupos.
9. Revisão clínica e técnica.
10. Registro e aprovação de release.
11. Monitoramento e possibilidade de rollback.

## Registro obrigatório

Cada versão deve declarar:

- finalidade e população;
- datasets e licenças;
- parâmetros;
- métricas de desempenho;
- falsos positivos e falsos negativos;
- limitações;
- responsável técnico;
- data de aprovação;
- versão anterior e plano de rollback.

## Linguagem

O motor fornece estimativas e apoio à decisão. Não deve emitir diagnóstico autônomo, prescrição automática ou certeza clínica incompatível com a evidência.
