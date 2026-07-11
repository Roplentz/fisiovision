# Sprint 14 — API HTTP protegida

## Execução

Compile o projeto e configure:

- `FISIOVISION_RELEASES_FILE`: arquivo JSON com releases e relatórios;
- `FISIOVISION_JWT_ISSUER`;
- `FISIOVISION_JWT_AUDIENCE`;
- `FISIOVISION_JWKS_URL`;
- `PORT` opcional, padrão 8080.

A API valida JWT RS256 pelo JWKS, issuer, audience, exp, nbf e a claim `consumers`. O rate limit usa sujeito + consumidor.

## Observabilidade

Cada requisição gera JSON estruturado com request ID, consumidor, sujeito, status e duração. Tokens, modelos, landmarks e dados clínicos não entram nos logs.

O limitador em memória é adequado para uma instância. Produção distribuída deve usar Redis ou gateway equivalente, além de TLS, rotação de chaves, cache controlado de JWKS e armazenamento confiável de releases.
