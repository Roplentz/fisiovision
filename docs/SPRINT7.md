# Sprint 7 — MediaPipe direto no navegador

O Reviewer inicializa o MediaPipe Pose Landmarker em modo `VIDEO`, processa o vídeo local em 15 FPS e cria automaticamente o artefato `fisiovision-landmarks-v0.1`.

## Operação

1. Selecione um vídeo autorizado.
2. Clique em **Executar MediaPipe**.
3. O navegador baixa o runtime WASM e o modelo Pose Landmarker Lite.
4. O vídeo é percorrido localmente e o progresso é exibido.
5. A sobreposição fica disponível para revisão.
6. O processamento pode ser cancelado a qualquer momento.

O vídeo não é enviado. Há apenas downloads do runtime e do modelo do MediaPipe. A inferência síncrona é intercalada com pausas para preservar a resposta da interface.

Referência oficial: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js
