from dataclasses import dataclass

from app.models.modelos import TipoConsumo
from app.services.calculos import (
    consumo_por_tipo,
    custo_por_tipo,
    pontuacao_ranking,
    reducao_atual_percentual,
    total_co2_evitado,
    total_reciclado,
)


@dataclass
class EntradaReciclagemFake:
    quantidade: float
    co2_evitado: float


@dataclass
class EntradaConsumoFake:
    tipo: TipoConsumo
    consumo: float
    custo: float
    mes_referencia: str


def test_totais_reciclagem_e_co2():
    entradas = [
        EntradaReciclagemFake(quantidade=10, co2_evitado=20),
        EntradaReciclagemFake(quantidade=2.5, co2_evitado=3.5),
    ]
    assert total_reciclado(entradas) == 12.5
    assert total_co2_evitado(entradas) == 23.5


def test_totais_consumo_e_custo_por_tipo():
    entradas = [
        EntradaConsumoFake(TipoConsumo.agua, consumo=100, custo=50, mes_referencia="2026-03"),
        EntradaConsumoFake(TipoConsumo.energia, consumo=20, custo=10, mes_referencia="2026-03"),
        EntradaConsumoFake(TipoConsumo.agua, consumo=90, custo=45, mes_referencia="2026-04"),
    ]
    assert consumo_por_tipo(entradas, TipoConsumo.agua) == 190
    assert custo_por_tipo(entradas, TipoConsumo.agua) == 95
    assert consumo_por_tipo(entradas, TipoConsumo.energia) == 20


def test_reducao_percentual_quando_mes_anterior_zero():
    entradas = [
        EntradaConsumoFake(TipoConsumo.energia, consumo=10, custo=10, mes_referencia="2026-04"),
        EntradaConsumoFake(TipoConsumo.energia, consumo=0, custo=0, mes_referencia="2026-03"),
    ]
    assert reducao_atual_percentual(entradas, TipoConsumo.energia) == 0.0


def test_pontuacao_ranking_oficial():
    assert pontuacao_ranking(100, 30) == 350.0

