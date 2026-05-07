# 8) CI/CD para Azure

## 8.1 Estratégia de pipeline

## Pipeline Frontend
- Build React/Vite.
- Testes (unitários + lint).
- Publicação em Azure Static Web Apps ou App Service.

## Pipeline Backend
- Instalação de dependências Python.
- Testes (`pytest`).
- Migrações Alembic em ambiente alvo.
- Build de imagem (quando Container Apps).
- Deploy em Azure App Service ou Container Apps.

## 8.2 Ambientes

- `dev`: integração contínua, dados não produtivos.
- `hml`: homologação com massa de teste controlada.
- `prod`: produção com aprovação manual.

## 8.3 Segredos e configuração

- Segredos no Azure Key Vault:
  - URL banco;
  - chave JWT;
  - credenciais de IA;
  - credenciais de deploy.
- Injeção por variáveis de ambiente no runtime.

## 8.4 Observabilidade e operação

- Application Insights:
  - latência;
  - falhas;
  - traces distribuídos.
- Alertas:
  - erro 5xx alto;
  - falha de autenticação anômala;
  - falha de migração.

## 8.5 Rollback

- Deploy blue/green ou slot swap.
- Banco:
  - backups automáticos;
  - migrations reversíveis;
  - ponto de restauração antes de releases críticas.
