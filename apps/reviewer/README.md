# FisioVision Reviewer

Aplicação estática, local e sem backend.

Abra `index.html` por um servidor estático (por exemplo, `npx serve apps/reviewer`). Selecione um vídeo autorizado e importe um artefato `fisiovision-landmarks-v0.1`.

A aplicação sincroniza o vídeo aos landmarks, desenha o esqueleto, coleta o ground truth e baixa um pacote JSON. O vídeo é mantido em uma URL temporária do navegador e nunca entra no pacote.

Antes de usar o pacote em validação, substitua a base legal de exemplo por um registro real no manifesto.
