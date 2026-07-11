# FisioVision Engine

Motor clínico configurável de visão computacional do ecossistema **FisioHub**.

## Estado atual — v0.6.0

- motor biomecânico e protocolo de agachamento;
- integração MediaPipe e benchmark auditável;
- ferramenta local de empacotamento;
- interface web local em `apps/reviewer`;
- vídeo sincronizado com sobreposição de landmarks;
- revisão de ground truth, revisor e base legal obrigatórios;
- download do pacote sem vídeo ou nome do arquivo original.

## Executar o Reviewer

```bash
npx serve apps/reviewer
```

Abra o endereço local, selecione um vídeo autorizado, importe o artefato de landmarks e revise os dados. Todo o processamento da interface ocorre no navegador.

## Governança e limite clínico

O baseline atual não demonstra validade clínica. O FisioVision gera estimativas de apoio à decisão; resultados exigem confirmação profissional e não constituem diagnóstico. Consulte `apps/reviewer/README.md`.
