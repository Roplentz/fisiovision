# Open Pilates Validation Pack v0.1

## Objetivo

Criar uma base progressiva e auditável de mídia aberta para desenvolvimento e validação do FisioVision sem contaminar o produto com fontes não comerciais.

## Fontes aceitas

- CC0;
- CC BY 3.0/4.0;
- CC BY-SA 4.0, com revisão das obrigações de compartilhamento;
- arquivos hospedados em repositórios que permitam download e processamento.

Cada item exige revisão individual de autoria, licença, origem e direitos de imagem. “Gratuito” não significa “aberto”.

## Fontes bloqueadas por padrão

- YouTube comum;
- Pixabay/Mixkit usados como dataset ou por extração automatizada;
- licenças NC, ND ou apenas acadêmicas;
- arquivos sem licença individual verificável;
- scraping ou download em massa sem autorização.

## Primeiro piloto

The Hundred, Wikimedia Commons, CC BY 3.0. O catálogo registra atribuição e URL direta. O vídeo fica em `data/open-media/`, ignorado pelo Git. Antes de uso em demonstração ou produto, é obrigatória revisão de direitos da pessoa retratada.

## Execução local

`npm run dataset:open-pilates -- --accept-cc-by --id=wikimedia-pilates-hundred-2018`

O downloader:

1. lê o catálogo versionado;
2. aceita somente hosts aprovados;
3. exige aceite explícito da licença;
4. limita o tamanho;
5. calcula SHA-256;
6. grava um registro de proveniência;
7. nunca adiciona o vídeo ao Git.

## Próximas etapas

1. extrair landmarks MediaPipe;
2. segmentar manualmente o trecho do Hundred;
3. executar o protocolo `pilates-the-hundred`;
4. revisar contagem e qualidade por fisioterapeuta;
5. catalogar falhas;
6. expandir apenas com mídias juridicamente compatíveis;
7. adicionar ASPset-510 CC0 para robustez 2D/3D geral.
