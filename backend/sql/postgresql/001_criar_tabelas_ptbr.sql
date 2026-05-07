-- Script PostgreSQL (Azure Database for PostgreSQL)
-- Tabelas em português para OEP ESG

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'papel_usuario_enum') THEN
    CREATE TYPE papel_usuario_enum AS ENUM ('coordinator', 'teacher', 'student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_consumo_enum') THEN
    CREATE TYPE tipo_consumo_enum AS ENUM ('agua', 'energia');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acao_auditoria_enum') THEN
    CREATE TYPE acao_auditoria_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(120) NOT NULL,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  cidade VARCHAR(120),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login_em TIMESTAMPTZ NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS perfis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_completo VARCHAR(150) NOT NULL,
  escola_id UUID NULL REFERENCES escolas(id),
  fuso_horario VARCHAR(60) NOT NULL DEFAULT 'America/Sao_Paulo',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS papeis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  papel papel_usuario_enum NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, papel)
);

CREATE TABLE IF NOT EXISTS entradas_reciclagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  material VARCHAR(120) NOT NULL,
  material_normalizado VARCHAR(120) NOT NULL,
  quantidade NUMERIC(14,3) NOT NULL CHECK (quantidade > 0),
  co2_evitado NUMERIC(14,3) NOT NULL CHECK (co2_evitado > 0),
  data_lancamento DATE NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_entradas_reciclagem_escola_data ON entradas_reciclagem(escola_id, data_lancamento);
CREATE INDEX IF NOT EXISTS ix_entradas_reciclagem_material_norm ON entradas_reciclagem(material_normalizado);

CREATE TABLE IF NOT EXISTS entradas_consumo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo tipo_consumo_enum NOT NULL,
  mes_referencia CHAR(7) NOT NULL CHECK (mes_referencia ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  custo NUMERIC(14,2) NOT NULL CHECK (custo >= 0),
  consumo NUMERIC(14,3) NOT NULL CHECK (consumo >= 0),
  data_lancamento DATE NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_entradas_consumo_escola_mes_tipo ON entradas_consumo(escola_id, mes_referencia, tipo);

CREATE TABLE IF NOT EXISTS metas_consumo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id),
  tipo tipo_consumo_enum NOT NULL,
  percentual_reducao NUMERIC(5,2) NOT NULL CHECK (percentual_reducao BETWEEN 0 AND 100),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (escola_id, tipo)
);

CREATE TABLE IF NOT EXISTS mensagens_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID NOT NULL REFERENCES escolas(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  nome_usuario VARCHAR(100) NOT NULL,
  mensagem VARCHAR(1000) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auditoria_alteracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_alvo VARCHAR(80) NOT NULL,
  registro_id UUID NOT NULL,
  acao acao_auditoria_enum NOT NULL,
  alterado_por_usuario_id UUID NULL REFERENCES usuarios(id),
  antes JSONB NULL,
  depois JSONB NULL,
  correlation_id VARCHAR(100) NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_auditoria_tabela_registro_criado_em ON auditoria_alteracoes(tabela_alvo, registro_id, criado_em);

CREATE TABLE IF NOT EXISTS tokens_atualizacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expira_em TIMESTAMPTZ NOT NULL,
  revogado_em TIMESTAMPTZ NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parametros_sistema (
  chave VARCHAR(80) PRIMARY KEY,
  valor_json JSONB NOT NULL,
  versao INT NOT NULL DEFAULT 1,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
