# Benchmark público preliminar — Keraal sample 2022

## Proveniência

- Dataset: Keraal Low Back Pain Physical Rehabilitation Dataset
- Finalidade: benchmark de pesquisa não comercial
- Licença: CC-BY-NC-SA
- Arquivo: `keraal_sample_2022.zip`
- Tamanho local: 114 MB
- SHA-256: `adeaeb35c30c68b30e54274ac2953dcbe254d081027644abfacfc7b4ad9bfca8`
- Data da execução: 2026-07-12

## Cobertura da amostra

- 10 vídeos RGB
- 10 sequências BlazePose
- 10 sequências OpenPose
- 10 sequências Kinect
- 6 sequências Vicon
- 2 arquivos de anotação clínica
- 2.444 frames com identificadores presentes em BlazePose e OpenPose

## Concordância angular 2D

Diferença definida como OpenPose − BlazePose.

| Métrica | Frames válidos | MAE (°) | RMSE (°) | Viés (°) | Limites de concordância 95% (°) |
|---|---:|---:|---:|---:|---:|
| Cotovelo esquerdo | 2.007 | 22,08 | 38,91 | -3,50 | -79,48 a 72,48 |
| Cotovelo direito | 1.988 | 23,21 | 40,35 | -1,78 | -80,81 a 77,25 |
| Ombro esquerdo | 2.033 | 27,95 | 52,23 | -4,99 | -106,92 a 96,94 |
| Ombro direito | 2.040 | 27,92 | 52,86 | -1,39 | -104,99 a 102,21 |

## Interpretação

A concordância é insuficiente para tratar BlazePose e OpenPose como fontes equivalentes de ângulos clínicos. O viés médio é relativamente pequeno, mas os erros absolutos e limites de concordância são grandes, indicando divergências frame a frame e não apenas um deslocamento sistemático.

## Limitações

- Resultado preliminar sem filtragem Butterworth.
- Pareamento pelo número do frame, sem confirmação independente de sincronização.
- OpenPose do dataset não fornece confiança por articulação neste formato.
- BlazePose é 3D, mas esta comparação usa somente a projeção 2D.
- Sports2D e RTMPose ainda não foram executados.
- Os exercícios Keraal são CTK, ELK e RTK, não agachamento.
- O dataset é não comercial e não pode promover diretamente uma release comercial.

## Próxima passagem

1. Aplicar filtro e gates de estabilidade segmentar.
2. Estratificar por exercício, vídeo e qualidade.
3. Comparar com Kinect/Vicon quando a definição articular for compatível.
4. Executar RTMPose sobre os 10 vídeos.
5. Executar Sports2D como referência externa.
