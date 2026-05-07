# 7) Plano de Testes (Backend e Frontend)

## 7.1 Objetivos

- Garantir regressão zero nas funcionalidades existentes.
- Garantir consistência dos cálculos oficiais e ranking.
- Validar segurança (auth, RBAC, escopo por escola).
- Validar exportações e endpoint de IA.

## 7.2 Estratégia

- Pirâmide de testes:
  - Unitários (regras de cálculo e validações).
  - Integração (API + banco).
  - E2E frontend (fluxos críticos).

## 7.3 Casos críticos de backend

## Autenticação
- Cadastro com dados válidos.
- Cadastro com email já existente.
- Login válido e inválido.
- Refresh token válido, expirado e revogado.
- Logout revogando refresh token.

## Autorização por role
- `coordinator` acessa todas as escolas.
- `teacher` e `student` acessam apenas escola vinculada.
- Operações de admin bloqueadas para não-coordinator.

## CRUD principal
- Criar/listar entradas de reciclagem.
- Criar/listar entradas de consumo.
- Criar/atualizar metas de consumo.
- Rejeitar dados inválidos (422).
- Bloquear outliers acima dos limites configurados.

## Cálculos e relatórios
- `total_reciclado`.
- `total_co2_evitado`.
- `consumo_agua` e `consumo_energia`.
- `custo_agua` e `custo_energia`.
- `reducao_atual_percentual`, incluindo divisor zero.
- Ranking com fórmula oficial e desempate.

## Exportações
- Export CSV com conteúdo consistente.
- Export PDF responde binário e código 200.

## IA
- Endpoint `/api/v1/ia/chat` com provider mock.
- Falha controlada quando provider externo indisponível.

## 7.4 Casos críticos de frontend

- Login/cadastro completo.
- Registro de entrada de reciclagem.
- Registro de entrada de consumo e metas.
- Leitura de dashboards por escola.
- Painel de coordenação consolidado.
- Painel administrativo de usuários/perfis.
- Exportação CSV/PDF.
- Assistente IA em fluxo autenticado.

## 7.5 Casos de borda

- `month` fora do padrão `YYYY-MM`.
- `entry_date` inválida.
- `quantity = 0` e `co2_saved = 0`.
- `cost < 0` e `consumption < 0`.
- usuário sem escola vinculada.
- escola inexistente.
- atualização retroativa fora da janela permitida.

## 7.6 Regressão automática dos cálculos

- Fixtures fixas por escola e por mês.
- Snapshot dos resultados esperados.
- Comparação determinística:
  - totais;
  - redução percentual;
  - ranking.
- Executar em toda pipeline CI.
