import pytest
from pydantic import ValidationError

from app.models.modelos import TipoConsumo
from app.schemas.entradas import EntradaConsumoCriacao


def test_mes_referencia_valido():
    modelo = EntradaConsumoCriacao(
        escola_id="00000000-0000-0000-0000-000000000001",
        tipo=TipoConsumo.agua,
        mes_referencia="2026-05",
        custo=100.0,
        consumo=200.0,
        data_lancamento="2026-05-07",
    )
    assert modelo.mes_referencia == "2026-05"


@pytest.mark.parametrize("mes_invalido", ["05/2026", "2026-13", "2026-00", "2026-5"])
def test_mes_referencia_invalido(mes_invalido: str):
    with pytest.raises(ValidationError):
        EntradaConsumoCriacao(
            escola_id="00000000-0000-0000-0000-000000000001",
            tipo=TipoConsumo.energia,
            mes_referencia=mes_invalido,
            custo=100.0,
            consumo=200.0,
            data_lancamento="2026-05-07",
        )

