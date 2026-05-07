"""Estrutura inicial PT-BR

Revision ID: 20260507_0001
Revises:
Create Date: 2026-05-07 00:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260507_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    papel_usuario_enum = sa.Enum(
        "coordinator", "teacher", "student", name="papel_usuario_enum"
    )
    tipo_consumo_enum = sa.Enum("agua", "energia", name="tipo_consumo_enum")
    tipo_meta_consumo_enum = sa.Enum("agua", "energia", name="tipo_meta_consumo_enum")
    acao_auditoria_enum = sa.Enum("INSERT", "UPDATE", "DELETE", name="acao_auditoria_enum")

    bind = op.get_bind()
    papel_usuario_enum.create(bind, checkfirst=True)
    tipo_consumo_enum.create(bind, checkfirst=True)
    tipo_meta_consumo_enum.create(bind, checkfirst=True)
    acao_auditoria_enum.create(bind, checkfirst=True)

    op.create_table(
        "escolas",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("codigo", sa.String(length=40), nullable=False),
        sa.Column("cidade", sa.String(length=120), nullable=True),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("codigo"),
    )

    op.create_table(
        "usuarios",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("senha_hash", sa.String(length=255), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("ultimo_login_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "perfis_usuario",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nome_completo", sa.String(length=150), nullable=False),
        sa.Column("escola_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("fuso_horario", sa.String(length=60), server_default="America/Sao_Paulo", nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["escola_id"], ["escolas.id"]),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("usuario_id"),
    )

    op.create_table(
        "papeis_usuario",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("papel", papel_usuario_enum, nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("usuario_id", "papel", name="uq_papeis_usuario_usuario_papel"),
    )

    op.create_table(
        "entradas_reciclagem",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("escola_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("material", sa.String(length=120), nullable=False),
        sa.Column("material_normalizado", sa.String(length=120), nullable=False),
        sa.Column("quantidade", sa.Numeric(14, 3), nullable=False),
        sa.Column("co2_evitado", sa.Numeric(14, 3), nullable=False),
        sa.Column("data_lancamento", sa.Date(), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("quantidade > 0", name="ck_entradas_reciclagem_quantidade_positiva"),
        sa.CheckConstraint("co2_evitado > 0", name="ck_entradas_reciclagem_co2_positivo"),
        sa.ForeignKeyConstraint(["escola_id"], ["escolas.id"]),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_entradas_reciclagem_escola_data", "entradas_reciclagem", ["escola_id", "data_lancamento"])
    op.create_index("ix_entradas_reciclagem_material_norm", "entradas_reciclagem", ["material_normalizado"])

    op.create_table(
        "entradas_consumo",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("escola_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tipo", tipo_consumo_enum, nullable=False),
        sa.Column("mes_referencia", sa.String(length=7), nullable=False),
        sa.Column("custo", sa.Numeric(14, 2), nullable=False),
        sa.Column("consumo", sa.Numeric(14, 3), nullable=False),
        sa.Column("data_lancamento", sa.Date(), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("custo >= 0", name="ck_entradas_consumo_custo_nao_negativo"),
        sa.CheckConstraint("consumo >= 0", name="ck_entradas_consumo_consumo_nao_negativo"),
        sa.CheckConstraint("mes_referencia ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'", name="ck_entradas_consumo_mes_referencia"),
        sa.ForeignKeyConstraint(["escola_id"], ["escolas.id"]),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_entradas_consumo_escola_mes_tipo",
        "entradas_consumo",
        ["escola_id", "mes_referencia", "tipo"],
    )

    op.create_table(
        "metas_consumo",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("escola_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tipo", tipo_meta_consumo_enum, nullable=False),
        sa.Column("percentual_reducao", sa.Numeric(5, 2), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint(
            "percentual_reducao >= 0 AND percentual_reducao <= 100",
            name="ck_metas_consumo_percentual",
        ),
        sa.ForeignKeyConstraint(["escola_id"], ["escolas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("escola_id", "tipo", name="uq_metas_consumo_escola_tipo"),
    )

    op.create_table(
        "mensagens_chat",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("escola_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nome_usuario", sa.String(length=100), nullable=False),
        sa.Column("mensagem", sa.String(length=1000), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["escola_id"], ["escolas.id"]),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "auditoria_alteracoes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tabela_alvo", sa.String(length=80), nullable=False),
        sa.Column("registro_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("acao", acao_auditoria_enum, nullable=False),
        sa.Column("alterado_por_usuario_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("antes", sa.JSON(), nullable=True),
        sa.Column("depois", sa.JSON(), nullable=True),
        sa.Column("correlation_id", sa.String(length=100), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["alterado_por_usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_auditoria_tabela_registro_criado_em",
        "auditoria_alteracoes",
        ["tabela_alvo", "registro_id", "criado_em"],
    )

    op.create_table(
        "tokens_atualizacao",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revogado_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )

    op.create_table(
        "parametros_sistema",
        sa.Column("chave", sa.String(length=80), nullable=False),
        sa.Column("valor_json", sa.JSON(), nullable=False),
        sa.Column("versao", sa.Integer(), server_default="1", nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("chave"),
    )


def downgrade() -> None:
    op.drop_table("parametros_sistema")
    op.drop_table("tokens_atualizacao")
    op.drop_index("ix_auditoria_tabela_registro_criado_em", table_name="auditoria_alteracoes")
    op.drop_table("auditoria_alteracoes")
    op.drop_table("mensagens_chat")
    op.drop_table("metas_consumo")
    op.drop_index("ix_entradas_consumo_escola_mes_tipo", table_name="entradas_consumo")
    op.drop_table("entradas_consumo")
    op.drop_index("ix_entradas_reciclagem_material_norm", table_name="entradas_reciclagem")
    op.drop_index("ix_entradas_reciclagem_escola_data", table_name="entradas_reciclagem")
    op.drop_table("entradas_reciclagem")
    op.drop_table("papeis_usuario")
    op.drop_table("perfis_usuario")
    op.drop_table("usuarios")
    op.drop_table("escolas")

    bind = op.get_bind()
    sa.Enum(name="acao_auditoria_enum").drop(bind, checkfirst=True)
    sa.Enum(name="tipo_meta_consumo_enum").drop(bind, checkfirst=True)
    sa.Enum(name="tipo_consumo_enum").drop(bind, checkfirst=True)
    sa.Enum(name="papel_usuario_enum").drop(bind, checkfirst=True)

