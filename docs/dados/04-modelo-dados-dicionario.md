# 4) Modelo de Dados Final + Dicionário (PT-BR)

## 4.1 Convenção de nomenclatura

- Tabelas em português e `snake_case`.
- Campos em português e `snake_case`.
- Chaves primárias UUID.
- Campos de auditoria padrão: `criado_em`, `atualizado_em`.

## 4.2 Mapeamento de entidades (AS-IS -> TO-BE)

| Entidade lógica | Atual (Supabase) | TO-BE (PostgreSQL Azure) |
|---|---|---|
| Escolas | `schools` | `escolas` |
| Usuários | `auth.users` + `profiles` | `usuarios` + `perfis_usuario` |
| Papéis | `user_roles` | `papeis_usuario` |
| Entradas reciclagem | `recycling_entries` | `entradas_reciclagem` |
| Entradas consumo | `consumption_entries` | `entradas_consumo` |
| Metas consumo | `consumption_goals` | `metas_consumo` |
| Chat | `chat_messages` | `mensagens_chat` |
| Auditoria | (não padronizada) | `auditoria_alteracoes` |
| Refresh token | (Supabase interno) | `tokens_atualizacao` |

## 4.3 Tabelas finais

## `escolas`
- `id` UUID PK
- `nome` VARCHAR(120) NOT NULL
- `codigo` VARCHAR(40) NOT NULL UNIQUE
- `cidade` VARCHAR(120) NULL
- `latitude` NUMERIC(9,6) NULL
- `longitude` NUMERIC(9,6) NULL
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL

## `usuarios`
- `id` UUID PK
- `email` VARCHAR(255) NOT NULL UNIQUE
- `senha_hash` VARCHAR(255) NOT NULL
- `ativo` BOOLEAN NOT NULL DEFAULT TRUE
- `ultimo_login_em` TIMESTAMPTZ NULL
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL

## `perfis_usuario`
- `id` UUID PK
- `usuario_id` UUID NOT NULL UNIQUE FK -> `usuarios.id`
- `nome_completo` VARCHAR(150) NOT NULL
- `escola_id` UUID NULL FK -> `escolas.id` (coordenador pode ficar sem escola fixa)
- `fuso_horario` VARCHAR(60) NOT NULL DEFAULT `America/Sao_Paulo`
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL

## `papeis_usuario`
- `id` UUID PK
- `usuario_id` UUID NOT NULL FK -> `usuarios.id`
- `papel` ENUM(`coordinator`,`teacher`,`student`) NOT NULL
- `criado_em` TIMESTAMPTZ NOT NULL
- UNIQUE (`usuario_id`, `papel`)

## `entradas_reciclagem`
- `id` UUID PK
- `escola_id` UUID NOT NULL FK -> `escolas.id`
- `usuario_id` UUID NOT NULL FK -> `usuarios.id`
- `material` VARCHAR(120) NOT NULL
- `material_normalizado` VARCHAR(120) NOT NULL
- `quantidade` NUMERIC(14,3) NOT NULL CHECK `quantidade > 0`
- `co2_evitado` NUMERIC(14,3) NOT NULL CHECK `co2_evitado > 0`
- `data_lancamento` DATE NOT NULL (`YYYY-MM-DD`)
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL

## `entradas_consumo`
- `id` UUID PK
- `escola_id` UUID NOT NULL FK -> `escolas.id`
- `usuario_id` UUID NOT NULL FK -> `usuarios.id`
- `tipo` ENUM(`agua`,`energia`) NOT NULL
- `mes_referencia` CHAR(7) NOT NULL (`YYYY-MM`)
- `custo` NUMERIC(14,2) NOT NULL CHECK `custo >= 0`
- `consumo` NUMERIC(14,3) NOT NULL CHECK `consumo >= 0`
- `data_lancamento` DATE NOT NULL (`YYYY-MM-DD`)
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL

## `metas_consumo`
- `id` UUID PK
- `escola_id` UUID NOT NULL FK -> `escolas.id`
- `tipo` ENUM(`agua`,`energia`) NOT NULL
- `percentual_reducao` NUMERIC(5,2) NOT NULL CHECK `percentual_reducao BETWEEN 0 AND 100`
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL
- UNIQUE (`escola_id`, `tipo`)

## `mensagens_chat`
- `id` UUID PK
- `escola_id` UUID NOT NULL FK -> `escolas.id`
- `usuario_id` UUID NOT NULL FK -> `usuarios.id`
- `nome_usuario` VARCHAR(100) NOT NULL
- `mensagem` VARCHAR(1000) NOT NULL
- `criado_em` TIMESTAMPTZ NOT NULL
- `atualizado_em` TIMESTAMPTZ NOT NULL

## `auditoria_alteracoes`
- `id` UUID PK
- `tabela_alvo` VARCHAR(80) NOT NULL
- `registro_id` UUID NOT NULL
- `acao` ENUM(`INSERT`,`UPDATE`,`DELETE`) NOT NULL
- `alterado_por_usuario_id` UUID NULL FK -> `usuarios.id`
- `antes` JSONB NULL
- `depois` JSONB NULL
- `correlation_id` VARCHAR(100) NULL
- `criado_em` TIMESTAMPTZ NOT NULL

## `tokens_atualizacao`
- `id` UUID PK
- `usuario_id` UUID NOT NULL FK -> `usuarios.id`
- `token_hash` VARCHAR(255) NOT NULL UNIQUE
- `expira_em` TIMESTAMPTZ NOT NULL
- `revogado_em` TIMESTAMPTZ NULL
- `criado_em` TIMESTAMPTZ NOT NULL

## `parametros_sistema`
- `chave` VARCHAR(80) PK
- `valor_json` JSONB NOT NULL
- `versao` INT NOT NULL DEFAULT 1
- `atualizado_em` TIMESTAMPTZ NOT NULL

## 4.4 Índices recomendados

- `entradas_reciclagem(escola_id, data_lancamento)`
- `entradas_reciclagem(material_normalizado)`
- `entradas_consumo(escola_id, mes_referencia, tipo)`
- `metas_consumo(escola_id, tipo)` único
- `papeis_usuario(usuario_id, papel)` único
- `auditoria_alteracoes(tabela_alvo, registro_id, criado_em desc)`

## 4.5 Regras de validação (obrigatórias)

- `quantidade > 0`
- `co2_evitado > 0`
- `custo >= 0`
- `consumo >= 0`
- `material` sanitizado e normalizado (`material_normalizado`)
- `data_lancamento` ISO `YYYY-MM-DD`
- `mes_referencia` `YYYY-MM`
- Limites máximos configuráveis em `parametros_sistema`:
  - `limite_maximo_quantidade`
  - `limite_maximo_co2_evitado`
  - `limite_maximo_custo`
  - `limite_maximo_consumo`
