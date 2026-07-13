# Integração PilatesVision → FisioVision

## Fluxo MVP

1. O PilatesVision envia o vídeo diretamente para um bucket privado.
2. O backend gera uma URL HTTPS temporária de leitura.
3. O PilatesVision cria um job no FisioVision.
4. O frontend consulta o job até `completed` ou `failed`.
5. O vídeo nunca atravessa o bundle público do Lovable e sua URL não é devolvida pela API.

## Criar análise

```http
POST /v1/consumers/pilatesvision/analyses
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "exerciseId": "pilates-teaser",
  "videoUrl": "https://storage.example/private/video.mp4?signature=...",
  "idempotencyKey": "session-or-upload-id"
}
```

Resposta: `202 Accepted`, cabeçalho `Location` e job com status `queued`. Repetir a mesma chave retorna o mesmo job.

## Consultar

```http
GET /v1/consumers/pilatesvision/analyses/{analysisId}
Authorization: Bearer <JWT>
```

## Exercícios liberados

- `pilates-the-hundred`
- `pilates-single-leg-stretch`
- `pilates-swimming`
- `pilates-swan`
- `pilates-teaser`

Outros exercícios retornam `400 invalid_request` até validação clínica.

## Variáveis do Lovable/Supabase Edge Function

- `FISIOVISION_API_URL`
- `FISIOVISION_CONSUMER_ID=pilatesvision`
- credenciais para emitir o JWT esperado pelo FisioVision

O token deve ser emitido somente no backend/Edge Function. Nunca armazenar chave de assinatura ou token permanente no navegador.

## Persistência e worker

1. Aplicar `supabase/migrations/202607130001_fisiovision_analyses.sql`.
2. Configurar API e worker com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Configurar `FISIOVISION_VIDEO_HOSTS` com os hosts autorizados do Storage, separados por vírgula.
4. Instalar MediaPipe/OpenCV conforme o workflow de validação.
5. Executar a API com `npm run start:api` e o worker com `npm run start:worker`.

O worker faz claim atômico com `FOR UPDATE SKIP LOCKED`, limita o vídeo a 200 MB, recusa redirects e hosts não autorizados, extrai pose em diretório temporário, executa primeiro o gate de reconhecimento e só então o protocolo biomecânico. Arquivos temporários são removidos após cada job.

Para produção, API e worker devem rodar como serviços separados. A service-role key permanece exclusivamente no backend.
