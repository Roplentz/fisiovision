# Sprint 8 — Motor Biomecânico no Reviewer

Após extrair ou importar landmarks, o Reviewer executa automaticamente o protocolo de agachamento e apresenta:

- análise aceita ou rejeitada;
- confiança agregada;
- taxa de frames válidos e visibilidade média;
- repetições, tempo, amplitude aparente dos joelhos e inclinação do tronco;
- motivos explícitos de rejeição;
- aviso de uso clínico responsável.

O resultado completo do motor também é incorporado ao pacote baixado, preservando versão e rastreabilidade.

A implementação web mantém o mesmo contrato e limiares do executor TypeScript. Alterações futuras nos limiares devem atualizar os dois módulos e seus testes até que o pacote passe a ser distribuído como bundle único.
