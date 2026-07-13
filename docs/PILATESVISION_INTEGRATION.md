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

## Limite desta entrega

O contrato, autenticação, idempotência e consulta estão implementados. O armazenamento em memória deve ser substituído por PostgreSQL/Redis antes de múltiplas réplicas. O worker que baixa a URL temporária, extrai pose e atualiza o job será a próxima entrega.
