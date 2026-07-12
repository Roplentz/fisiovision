# M3GYM — protocolo de validação externa não comercial

Data: 2026-07-12  
Status: acesso pendente de aprovação pelos responsáveis do dataset  
Escopo: pesquisa clínica/metodológica e validação externa do FisioVision

## Regra de isolamento

O M3GYM será usado exclusivamente para validação acadêmica não comercial. É proibido:

- incorporar vídeos, imagens, landmarks ou meshes ao produto PilatesVision;
- redistribuir arquivos do dataset;
- publicar mídia identificável;
- treinar pesos destinados ao produto comercial;
- utilizar resultados individuais para diagnóstico ou assistência clínica;
- misturar o armazenamento M3GYM com dados de clientes.

O repositório contém somente código, manifests sem mídia, hashes, métricas agregadas e relatórios permitidos pelo acordo final.

## Objetivo primário

Avaliar desempenho dos 15 protocolos Pilates em condições externas, multivista e realistas:

1. taxa de vídeos/segmentos aceitos e rejeitados;
2. cobertura e visibilidade dos landmarks;
3. erro de contagem de repetições quando houver rótulo compatível;
4. erro angular 2D contra a anotação 2D do M3GYM;
5. erro da projeção 2D contra a referência 3D, quando permitido;
6. robustez por câmera, iluminação, oclusão e participante;
7. concordância entre MediaPipe, RTMPose e referência M3GYM;
8. calibração da confiança e análise de falhas.

## Plano de execução

### Fase 0 — acesso e governança

- obter aprovação formal pelo Data Access Protocol;
- arquivar versão do acordo, instituição aprovada e referência da autorização;
- confirmar quais artefatos e resultados agregados podem ser publicados;
- manter os dados brutos fora do Git e fora da infraestrutura comercial.

### Fase 1 — inventário cego

- importar apenas metadados e lista de ações;
- mapear ações M3GYM para os 15 protocolos sem observar resultados do motor;
- registrar incompatibilidades de nomenclatura, vista e execução;
- congelar o mapa antes da avaliação.

### Fase 2 — validação técnica

- executar extração de pose por câmera;
- converter coordenadas somente após verificar o schema oficial;
- avaliar qualidade e suitability antes das métricas;
- produzir resultados estratificados por sessão, câmera e condição.

### Fase 3 — validação clínica

- dois fisioterapeutas revisam amostra estratificada;
- divergências resolvidas por consenso;
- comparar contagem, fases, compensações observáveis e rejeições;
- não atribuir diagnóstico nem inferir carga/ativação muscular.

### Fase 4 — relatório

- publicar apenas estatísticas agregadas permitidas;
- separar resultados exploratórios de confirmatórios;
- declarar licença, seleção dos dados, perdas e limitações;
- não alterar limiares usando o conjunto final de teste.

## Divisão recomendada

- desenvolvimento: nenhum arquivo M3GYM;
- calibração: subconjunto autorizado separado do teste;
- teste externo final: participantes e sessões nunca usados na calibração;
- análise primária: por participante, evitando tratar frames como observações independentes.

## Critérios iniciais de sucesso

- disponibilidade de landmarks requeridos ≥ 90% nos segmentos compatíveis;
- erro de contagem absoluto mediano ≤ 1 repetição;
- taxa de rejeição justificável por qualidade/vista;
- erro angular reportado com MAE, RMSE, viés e limites de concordância;
- nenhuma violação da fronteira não comercial.
