from uuid import UUID

from pydantic import BaseModel, Field


class EscolaCriacao(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    codigo: str = Field(min_length=2, max_length=40)
    cidade: str | None = Field(default=None, max_length=120)
    latitude: float | None = None
    longitude: float | None = None


class EscolaResposta(BaseModel):
    id: UUID
    nome: str
    codigo: str
    cidade: str | None = None
    latitude: float | None = None
    longitude: float | None = None

