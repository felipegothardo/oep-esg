from collections import defaultdict
from typing import Iterable

from app.models.modelos import EntradaConsumo, EntradaReciclagem, TipoConsumo


def total_reciclado(entradas: Iterable[EntradaReciclagem]) -> float:
    return round(sum(float(e.quantidade) for e in entradas), 2)


def total_co2_evitado(entradas: Iterable[EntradaReciclagem]) -> float:
    return round(sum(float(e.co2_evitado) for e in entradas), 2)


def consumo_por_tipo(entradas: Iterable[EntradaConsumo], tipo: TipoConsumo) -> float:
    return round(sum(float(e.consumo) for e in entradas if e.tipo == tipo), 2)


def custo_por_tipo(entradas: Iterable[EntradaConsumo], tipo: TipoConsumo) -> float:
    return round(sum(float(e.custo) for e in entradas if e.tipo == tipo), 2)


def reducao_atual_percentual(entradas: Iterable[EntradaConsumo], tipo: TipoConsumo) -> float:
    entradas_tipo = [e for e in entradas if e.tipo == tipo]
    if len(entradas_tipo) < 2:
        return 0.0

    consumo_mes = defaultdict(float)
    for entrada in entradas_tipo:
        consumo_mes[entrada.mes_referencia] += float(entrada.consumo)

    meses_ordenados = sorted(consumo_mes.keys(), reverse=True)
    if len(meses_ordenados) < 2:
        return 0.0

    atual = consumo_mes[meses_ordenados[0]]
    anterior = consumo_mes[meses_ordenados[1]]
    if anterior == 0:
        return 0.0

    return round(((anterior - atual) / anterior) * 100, 2)


def pontuacao_ranking(total_reciclado_valor: float, total_co2_valor: float) -> float:
    return round(total_reciclado_valor * 0.5 + total_co2_valor * 10, 2)

