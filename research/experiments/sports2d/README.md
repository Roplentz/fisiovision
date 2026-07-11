# Experimento Sports2D

Objetivo: comparar ângulos do FisioVision/MediaPipe com Sports2D no mesmo conjunto autorizado, sem incorporar código Sports2D ao motor.

## Saídas

Para cada frame pareado:

- flexão dos joelhos;
- inclinação do tronco;
- timestamp;
- visibilidade;
- estado de qualidade.

O relatório deve calcular MAE, RMSE, viés e limites de concordância de 95%, estratificados por vista, câmera, amplitude e qualidade.

Sports2D funciona como referência externa de engenharia, não como ground truth clínico. Ground truth continua exigindo anotação ou sistema de referência apropriado.
