# FisioVision Control

Execute com `npx serve apps/control`.

O painel aceita somente releases aprovadas, gera configuração fixa para o consumidor, mantém histórico de rollback e assina cada operação com ECDSA P-256. A chave privada é não exportável e vive apenas na sessão; a exportação contém a chave pública e os eventos.

Em produção, substitua a chave efêmera por KMS/HSM e persista a trilha em armazenamento imutável.
