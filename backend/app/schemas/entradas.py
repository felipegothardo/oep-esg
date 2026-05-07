from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.modelos import TipoConsumo


def _validar_mes_referencia(valor: str) -> str:
    if len(valor) != 7 or valor[4] != "-":
        raise ValueError("Formato de mês inválido. Use YYYY-MM.")
    ano, mes = valor.split("-")
    if not (ano.isdigit() and mes.isdigit()):
        raise ValueError("Formato de mês inválido. Use YYYY-MM.")
    mes_int = int(mes)
    if mes_int < 1 or mes_int > 12:
        raise ValueError("Mês inválido.")
    return valor


class EntradaReciclagemCriacao(BaseModel):
    escola_id: UUID
    material: str = Field(min_length=1, max_length=120)
    quantidade: float = Field(gt=0)
    co2_evitado: float = Field(gt=0)
    data_lancamento: date


class EntradaReciclagemResposta(EntradaReciclagemCriacao):
    id: UUID
    usuario_id: UUID
    material_normalizado: str


class EntradaConsumoCriacao(BaseModel):
    escola_id: UUID
    tipo: TipoConsumo
    mes_referencia: str
    custo: float = Field(ge=0)
    consumo: float = Field(ge=0)
    data_lancamento: date

    @field_validator("mes_referencia")
    @classmethod
    def validar_mes_referencia(cls, valor: str) -> str:
        return _validar_mes_referencia(valor)


class EntradaConsumoResposta(EntradaConsumoCriacao):
    id: UUID
    usuario_id: UUID


class MetaConsumoRequest(BaseModel):
    escola_id: UUID
    tipo: TipoConsumo
    percentual_reducao: float = Field(ge=0, le=100)


class MetaConsumoResposta(MetaConsumoRequest):
    id: UUID

