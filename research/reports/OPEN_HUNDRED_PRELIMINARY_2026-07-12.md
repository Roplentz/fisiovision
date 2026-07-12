# Open Hundred — validação automática preliminar

Data: 2026-07-12  
Fonte: Wikimedia Commons, CC BY 3.0  
Mídia: `wikimedia-pilates-hundred-2018`  
SHA-256: `e63ee8eab2b91c894365ac2474d0fb596b3ceaf7506191aaa0fe93192aef3921`

## Pipeline

- vídeo: WebM, 80.623.941 bytes;
- origem: 29,970 fps;
- amostragem: 5 fps;
- frames decodificados: 16.439;
- frames amostrados: 2.740;
- frames com pose: 2.731;
- taxa de detecção: 99,6715%;
- extrator: MediaPipe Pose 0.10.21, complexidade 1;
- janelas: 12 s, passo de 4 s;
- protocolo: `pilates-the-hundred` v0.1.0.

## Resultado

O motor encontrou uma janela aceita:

- início: 32,0 s;
- fim: 44,0 s;
- confiança: 0,974;
- bombeamentos completos: 4;
- cadência: 20,319 bombeamentos/min;
- amplitude dos braços: 0,493 do comprimento aparente do tronco;
- assimetria média das mãos: 0,058;
- deriva máxima do tronco: 0,017;
- variação do joelho esquerdo: 8,375°;
- variação do joelho direito: 8,143°;
- variação cabeça–tronco: 1,792°.

## Interpretação responsável

Este é um teste automático de pipeline, não uma validação clínica concluída. A janela de 32–44 s deve ser inspecionada visualmente por fisioterapeuta para confirmar:

1. se contém realmente o The Hundred;
2. se os quatro ciclos correspondem aos bombeamentos observados;
3. se o enquadramento atende ao protocolo;
4. se os landmarks não trocaram lados ou acompanharam objetos;
5. se a cadência baixa resulta de execução, amostragem ou subcontagem.

Até essa revisão, o resultado deve ser tratado como **candidato automático**, não como ground truth.

## Próximo passo

Gerar um clipe 32–44 s com overlay do esqueleto e contadores para revisão clínica, seguido de segmentação manual do trecho real do exercício e comparação entre contagem humana e automática.
