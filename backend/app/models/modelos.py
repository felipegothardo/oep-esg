import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.banco import Base


class PapelUsuario(str, enum.Enum):
    coordinator = "coordinator"
    teacher = "teacher"
    student = "student"


class TipoConsumo(str, enum.Enum):
    agua = "agua"
    energia = "energia"


class AcaoAuditoria(str, enum.Enum):
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class Escola(Base):
    __tablename__ = "escolas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    codigo: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    cidade: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    ultimo_login_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    perfil: Mapped["PerfilUsuario"] = relationship(back_populates="usuario", uselist=False)
    papeis: Mapped[list["PapelUsuarioDB"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")


class PerfilUsuario(Base):
    __tablename__ = "perfis_usuario"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    nome_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    escola_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("escolas.id"), nullable=True)
    fuso_horario: Mapped[str] = mapped_column(String(60), nullable=False, default="America/Sao_Paulo")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    usuario: Mapped[Usuario] = relationship(back_populates="perfil")
    escola: Mapped[Escola | None] = relationship()


class PapelUsuarioDB(Base):
    __tablename__ = "papeis_usuario"
    __table_args__ = (UniqueConstraint("usuario_id", "papel", name="uq_papeis_usuario_usuario_papel"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False
    )
    papel: Mapped[PapelUsuario] = mapped_column(Enum(PapelUsuario, name="papel_usuario_enum"), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    usuario: Mapped[Usuario] = relationship(back_populates="papeis")


class EntradaReciclagem(Base):
    __tablename__ = "entradas_reciclagem"
    __table_args__ = (
        CheckConstraint("quantidade > 0", name="ck_entradas_reciclagem_quantidade_positiva"),
        CheckConstraint("co2_evitado > 0", name="ck_entradas_reciclagem_co2_positivo"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escola_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("escolas.id"), nullable=False)
    usuario_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    material: Mapped[str] = mapped_column(String(120), nullable=False)
    material_normalizado: Mapped[str] = mapped_column(String(120), nullable=False)
    quantidade: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    co2_evitado: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    data_lancamento: Mapped[date] = mapped_column(Date, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class EntradaConsumo(Base):
    __tablename__ = "entradas_consumo"
    __table_args__ = (
        CheckConstraint("custo >= 0", name="ck_entradas_consumo_custo_nao_negativo"),
        CheckConstraint("consumo >= 0", name="ck_entradas_consumo_consumo_nao_negativo"),
        CheckConstraint(
            "mes_referencia ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'",
            name="ck_entradas_consumo_mes_referencia",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escola_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("escolas.id"), nullable=False)
    usuario_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    tipo: Mapped[TipoConsumo] = mapped_column(Enum(TipoConsumo, name="tipo_consumo_enum"), nullable=False)
    mes_referencia: Mapped[str] = mapped_column(String(7), nullable=False)
    custo: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    consumo: Mapped[float] = mapped_column(Numeric(14, 3), nullable=False)
    data_lancamento: Mapped[date] = mapped_column(Date, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class MetaConsumo(Base):
    __tablename__ = "metas_consumo"
    __table_args__ = (
        UniqueConstraint("escola_id", "tipo", name="uq_metas_consumo_escola_tipo"),
        CheckConstraint("percentual_reducao >= 0 AND percentual_reducao <= 100", name="ck_metas_consumo_percentual"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escola_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("escolas.id"), nullable=False)
    tipo: Mapped[TipoConsumo] = mapped_column(Enum(TipoConsumo, name="tipo_meta_consumo_enum"), nullable=False)
    percentual_reducao: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class MensagemChat(Base):
    __tablename__ = "mensagens_chat"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    escola_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("escolas.id"), nullable=False)
    usuario_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    nome_usuario: Mapped[str] = mapped_column(String(100), nullable=False)
    mensagem: Mapped[str] = mapped_column(String(1000), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class AuditoriaAlteracao(Base):
    __tablename__ = "auditoria_alteracoes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tabela_alvo: Mapped[str] = mapped_column(String(80), nullable=False)
    registro_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    acao: Mapped[AcaoAuditoria] = mapped_column(Enum(AcaoAuditoria, name="acao_auditoria_enum"), nullable=False)
    alterado_por_usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True
    )
    antes: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    depois: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    correlation_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class TokenAtualizacao(Base):
    __tablename__ = "tokens_atualizacao"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expira_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revogado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ParametroSistema(Base):
    __tablename__ = "parametros_sistema"

    chave: Mapped[str] = mapped_column(String(80), primary_key=True)
    valor_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    versao: Mapped[int] = mapped_column(nullable=False, default=1)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

