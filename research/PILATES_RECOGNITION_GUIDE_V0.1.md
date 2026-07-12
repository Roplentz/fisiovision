# Guia clínico de reconhecimento — PilatesVision v0.1

Este guia antecede qualquer cálculo biomecânico. O motor deve responder primeiro: **o vídeo é compatível com o exercício selecionado?**

## Regra de decisão

1. verificar vista e qualidade;
2. confirmar postura inicial;
3. confirmar pelo menos dois marcadores estruturais independentes;
4. confirmar a assinatura temporal do movimento;
5. testar confundidores conhecidos;
6. somente então executar métricas;
7. se falhar, retornar `exercise_pose_mismatch`, sem atribuir métricas ao exercício.

Uma métrica pode estar matematicamente correta e ainda pertencer ao exercício errado. Foi exatamente o observado no primeiro teste aberto do The Hundred.

## Perfis

| Exercício | Postura/vista | Assinatura obrigatória | Confundidores principais |
|---|---|---|---|
| Shoulder Bridge | dorsal/lateral | elevação e retorno da pelve | hip thrust, pelvic tilt |
| Side Leg Lift | lateral corporal/frontal-oblíqua | abdução da perna superior | Side Kick |
| Roll Down | ereto/lateral | flexão progressiva e retorno | Spine Stretch, forward bend |
| Single Leg Stretch | dorsal/frontal-oblíqua | alternância joelho flexionado/perna estendida | bicycle, criss cross |
| The Hundred | dorsal/lateral-oblíqua | cabeça elevada, pernas sustentadas, bombas curtas | gestos introdutórios, arm waving |
| Swimming | ventral/oblíqua-posterior | alternância contralateral contínua | Bird Dog, superman |
| Swan | ventral/lateral | extensão do tronco com pelve apoiada | cobra, push-up |
| Saw | sentado/frontal | alcance cruzado alternado | toe touch, spine twist |
| Spine Stretch Forward | long sitting/lateral | flexão simétrica sem cruzamento | Saw, Roll Down |
| Single Leg Circle | dorsal/frontal-oblíqua | círculo completo de uma perna | leg raise, bicycle |
| Side Kick | decúbito lateral/lateral | excursão frente–trás | Side Leg Lift |
| Leg Pull Front | prancha/lateral | elevação alternada das pernas | Plank, mountain climber |
| Plank | apoio anterior/lateral | sustentação isométrica sem alternância | Leg Pull Front, pike |
| Bird Dog | quadrúpede/lateral-oblíqua | extensão contralateral e retorno | Swimming, donkey kick |
| Teaser | dorsal/lateral | subida conjunta para V e retorno | sit-up, roll up, boat pose |

## Uso pelo motor

O arquivo `protocols/pilates/recognition-guide.v0.1.json` é a fonte estruturada. Nesta versão, os critérios são instruções auditáveis. Na próxima versão, cada critério será ligado a um detector geométrico/temporal e produzirá score, evidência e motivo de falha.

## Limites

O reconhecimento confirma compatibilidade observável, não execução “correta”, diagnóstico, ativação muscular, carga articular ou movimento fora do plano da câmera.
