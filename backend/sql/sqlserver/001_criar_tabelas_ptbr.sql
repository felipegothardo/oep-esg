-- Script SQL Server (Azure SQL Database)
-- Tabelas em português para OEP ESG

IF OBJECT_ID('dbo.escolas', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.escolas (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_escolas PRIMARY KEY DEFAULT NEWID(),
    nome NVARCHAR(120) NOT NULL,
    codigo NVARCHAR(40) NOT NULL CONSTRAINT UQ_escolas_codigo UNIQUE,
    cidade NVARCHAR(120) NULL,
    latitude DECIMAL(9,6) NULL,
    longitude DECIMAL(9,6) NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF OBJECT_ID('dbo.usuarios', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.usuarios (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_usuarios PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL CONSTRAINT UQ_usuarios_email UNIQUE,
    senha_hash NVARCHAR(255) NOT NULL,
    ativo BIT NOT NULL DEFAULT 1,
    ultimo_login_em DATETIME2 NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF OBJECT_ID('dbo.perfis_usuario', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.perfis_usuario (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_perfis_usuario PRIMARY KEY DEFAULT NEWID(),
    usuario_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT UQ_perfis_usuario_usuario UNIQUE,
    nome_completo NVARCHAR(150) NOT NULL,
    escola_id UNIQUEIDENTIFIER NULL,
    fuso_horario NVARCHAR(60) NOT NULL DEFAULT 'America/Sao_Paulo',
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_perfis_usuario_usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id),
    CONSTRAINT FK_perfis_usuario_escolas FOREIGN KEY (escola_id) REFERENCES dbo.escolas(id)
  );
END;

IF OBJECT_ID('dbo.papeis_usuario', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.papeis_usuario (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_papeis_usuario PRIMARY KEY DEFAULT NEWID(),
    usuario_id UNIQUEIDENTIFIER NOT NULL,
    papel NVARCHAR(20) NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_papeis_usuario_usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id),
    CONSTRAINT CK_papeis_usuario_papel CHECK (papel IN ('coordinator', 'teacher', 'student')),
    CONSTRAINT UQ_papeis_usuario_usuario_papel UNIQUE (usuario_id, papel)
  );
END;

IF OBJECT_ID('dbo.entradas_reciclagem', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.entradas_reciclagem (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_entradas_reciclagem PRIMARY KEY DEFAULT NEWID(),
    escola_id UNIQUEIDENTIFIER NOT NULL,
    usuario_id UNIQUEIDENTIFIER NOT NULL,
    material NVARCHAR(120) NOT NULL,
    material_normalizado NVARCHAR(120) NOT NULL,
    quantidade DECIMAL(14,3) NOT NULL,
    co2_evitado DECIMAL(14,3) NOT NULL,
    data_lancamento DATE NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_entradas_reciclagem_quantidade CHECK (quantidade > 0),
    CONSTRAINT CK_entradas_reciclagem_co2 CHECK (co2_evitado > 0),
    CONSTRAINT FK_entradas_reciclagem_escolas FOREIGN KEY (escola_id) REFERENCES dbo.escolas(id),
    CONSTRAINT FK_entradas_reciclagem_usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
  );
  CREATE INDEX IX_entradas_reciclagem_escola_data ON dbo.entradas_reciclagem(escola_id, data_lancamento);
END;

IF OBJECT_ID('dbo.entradas_consumo', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.entradas_consumo (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_entradas_consumo PRIMARY KEY DEFAULT NEWID(),
    escola_id UNIQUEIDENTIFIER NOT NULL,
    usuario_id UNIQUEIDENTIFIER NOT NULL,
    tipo NVARCHAR(20) NOT NULL,
    mes_referencia CHAR(7) NOT NULL,
    custo DECIMAL(14,2) NOT NULL,
    consumo DECIMAL(14,3) NOT NULL,
    data_lancamento DATE NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_entradas_consumo_tipo CHECK (tipo IN ('agua', 'energia')),
    CONSTRAINT CK_entradas_consumo_custo CHECK (custo >= 0),
    CONSTRAINT CK_entradas_consumo_consumo CHECK (consumo >= 0),
    CONSTRAINT CK_entradas_consumo_mes CHECK (mes_referencia LIKE '[1-2][0-9][0-9][0-9]-[0-1][0-9]'),
    CONSTRAINT FK_entradas_consumo_escolas FOREIGN KEY (escola_id) REFERENCES dbo.escolas(id),
    CONSTRAINT FK_entradas_consumo_usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
  );
  CREATE INDEX IX_entradas_consumo_escola_mes_tipo ON dbo.entradas_consumo(escola_id, mes_referencia, tipo);
END;

IF OBJECT_ID('dbo.metas_consumo', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.metas_consumo (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_metas_consumo PRIMARY KEY DEFAULT NEWID(),
    escola_id UNIQUEIDENTIFIER NOT NULL,
    tipo NVARCHAR(20) NOT NULL,
    percentual_reducao DECIMAL(5,2) NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_metas_consumo_tipo CHECK (tipo IN ('agua', 'energia')),
    CONSTRAINT CK_metas_consumo_percentual CHECK (percentual_reducao BETWEEN 0 AND 100),
    CONSTRAINT FK_metas_consumo_escolas FOREIGN KEY (escola_id) REFERENCES dbo.escolas(id),
    CONSTRAINT UQ_metas_consumo_escola_tipo UNIQUE (escola_id, tipo)
  );
END;

IF OBJECT_ID('dbo.mensagens_chat', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.mensagens_chat (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_mensagens_chat PRIMARY KEY DEFAULT NEWID(),
    escola_id UNIQUEIDENTIFIER NOT NULL,
    usuario_id UNIQUEIDENTIFIER NOT NULL,
    nome_usuario NVARCHAR(100) NOT NULL,
    mensagem NVARCHAR(1000) NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_mensagens_chat_escolas FOREIGN KEY (escola_id) REFERENCES dbo.escolas(id),
    CONSTRAINT FK_mensagens_chat_usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
  );
END;

IF OBJECT_ID('dbo.auditoria_alteracoes', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.auditoria_alteracoes (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_auditoria_alteracoes PRIMARY KEY DEFAULT NEWID(),
    tabela_alvo NVARCHAR(80) NOT NULL,
    registro_id UNIQUEIDENTIFIER NOT NULL,
    acao NVARCHAR(10) NOT NULL,
    alterado_por_usuario_id UNIQUEIDENTIFIER NULL,
    antes NVARCHAR(MAX) NULL,
    depois NVARCHAR(MAX) NULL,
    correlation_id NVARCHAR(100) NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_auditoria_acao CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
    CONSTRAINT FK_auditoria_usuarios FOREIGN KEY (alterado_por_usuario_id) REFERENCES dbo.usuarios(id)
  );
  CREATE INDEX IX_auditoria_tabela_registro_criado_em ON dbo.auditoria_alteracoes(tabela_alvo, registro_id, criado_em);
END;

IF OBJECT_ID('dbo.tokens_atualizacao', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.tokens_atualizacao (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_tokens_atualizacao PRIMARY KEY DEFAULT NEWID(),
    usuario_id UNIQUEIDENTIFIER NOT NULL,
    token_hash NVARCHAR(255) NOT NULL CONSTRAINT UQ_tokens_atualizacao_token_hash UNIQUE,
    expira_em DATETIME2 NOT NULL,
    revogado_em DATETIME2 NULL,
    criado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_tokens_atualizacao_usuarios FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
  );
END;

IF OBJECT_ID('dbo.parametros_sistema', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.parametros_sistema (
    chave NVARCHAR(80) NOT NULL CONSTRAINT PK_parametros_sistema PRIMARY KEY,
    valor_json NVARCHAR(MAX) NOT NULL,
    versao INT NOT NULL DEFAULT 1,
    atualizado_em DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;
