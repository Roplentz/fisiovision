# Sprint 12 — Ativação segura, rollback e auditoria

## Garantias

- somente releases com estado `approved` geram configuração de consumidor;
- ativações mantêm histórico da release anterior;
- rollback restaura apenas uma release ainda aprovada;
- cada operação exige ator, motivo e timestamp;
- eventos formam uma cadeia SHA-256;
- cada hash é assinado por um signer fornecido pelo ambiente seguro;
- adulteração de payload, ordem ou vínculo invalida a cadeia.

## Assinatura

O núcleo não armazena chaves privadas. Produção deve fornecer um signer apoiado por KMS, HSM ou WebCrypto com chave não exportável e uma função de verificação correspondente. O signer de teste não é adequado para produção.

## Consumidores

Os aplicativos consumidores recebem somente `fisiovision-consumer-config-v0.1`, que fixa release, motor, protocolo, modelo e checksum. Atualizações não aprovadas são bloqueadas antes da configuração.
