# Sprint 11 — Registro e promoção de versões

Cada release liga explicitamente:

- versão do motor;
- protocolo e versão;
- modelo, versão e checksum;
- relatório consolidado;
- estado research, candidate, approved ou deprecated.

A promoção é bloqueada quando os mínimos de amostras, acurácia, sensibilidade ou especificidade não são atingidos, ou quando MAE e rejeição excedem os máximos. Quando há baseline, regressões também podem bloquear a promoção.

A aprovação automatizada significa apenas elegibilidade técnica. A política exige aprovação profissional e plano de rollback antes de uso fora de pesquisa.
