from uuid import UUID

from pydantic import BaseModel


class DashboardEscolaResposta(BaseModel):
    escola_id: UUID
    total_reciclado: float
    total_co2_evitado: float
    consumo_agua: float
    consumo_energia: float
    custo_agua: float
    custo_energia: float


class RankingEscolaResposta(BaseModel):
    escola_id: UUID
    nome_escola: str
    total_reciclado: float
    total_co2_evitado: float
    pontuacao: float


class PainelCoordenacaoResposta(BaseModel):
    totais: dict
    ranking: list[RankingEscolaResposta]
    comparativo: list[dict]

