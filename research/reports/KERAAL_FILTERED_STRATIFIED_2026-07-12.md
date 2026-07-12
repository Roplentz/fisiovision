# Keraal — concordância filtrada e estratificada

Data: 2026-07-12  
Uso: pesquisa não comercial, CC-BY-NC-SA  
Filtro: Butterworth de segunda ordem, zero-phase, 10 Hz, corte em 2 Hz  
Diferença: OpenPose − BlazePose

## Resultados por exercício e classe

| Estrato | Métrica | n | MAE (°) | RMSE (°) | Viés (°) |
|---|---|---:|---:|---:|---:|
| CTK erro | Cotovelo E | 1462 | 21,13 | 35,72 | -5,46 |
| CTK erro | Cotovelo D | 1440 | 22,10 | 36,97 | -2,29 |
| CTK erro | Ombro E | 1487 | 19,84 | 36,00 | -8,06 |
| CTK erro | Ombro D | 1489 | 18,76 | 34,46 | 1,04 |
| CTK correto | Cotovelo E | 192 | 6,96 | 17,20 | 1,99 |
| CTK correto | Cotovelo D | 190 | 9,64 | 18,63 | -3,06 |
| CTK correto | Ombro E | 192 | 8,39 | 18,33 | -1,76 |
| CTK correto | Ombro D | 192 | 10,32 | 19,46 | -0,75 |
| ELK correto | Cotovelo E | 193 | 42,26 | 54,87 | -1,85 |
| ELK correto | Cotovelo D | 193 | 42,56 | 54,06 | 4,59 |
| ELK correto | Ombro E | 193 | 110,54 | 125,14 | 11,12 |
| ELK correto | Ombro D | 193 | 109,96 | 124,52 | -12,37 |
| RTK correto | Cotovelo E | 160 | 9,69 | 15,80 | 5,78 |
| RTK correto | Cotovelo D | 165 | 12,62 | 21,69 | -3,25 |
| RTK correto | Ombro E | 161 | 16,71 | 32,82 | 0,25 |
| RTK correto | Ombro D | 166 | 25,10 | 48,19 | -11,23 |

## Interpretação

A filtragem reduz ruído, mas não corrige divergências estruturais. CTK correto apresenta concordância moderada, enquanto ELK evidencia ambiguidade severa na definição do ângulo do ombro em projeção 2D. O pequeno viés combinado com MAE/RMSE altos reforça que os erros alternam direção ao longo do movimento.

O motor deve:

1. definir ângulos orientados ou normalizar ângulos suplementares quando biomecanicamente justificado;
2. aplicar suitability por vista e exercício;
3. rejeitar métricas cujo plano de movimento seja incompatível com a câmera;
4. não usar um limiar universal entre protocolos;
5. validar contra Kinect/Vicon, não contra outro estimador 2D apenas.

## Execução Sports2D/RTMPose

A instalação de Sports2D 0.8.34 foi iniciada e resolveu Pose2Sim/OpenSim, mas falhou ao obter dependências de `files.pythonhosted.org`, domínio bloqueado no ambiente atual. RTMPose depende do mesmo ecossistema Python/modelos e não foi executado. Nenhum resultado foi simulado.

Comando a reproduzir em ambiente com acesso PyPI:

`python -m pip install sports2d`

Depois, executar Sports2D e RTMPose sobre os dez vídeos listados no relatório preliminar.
