import unicodedata
from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.dependencias import obter_perfil_logado, obter_usuario_logado
from app.models.modelos import EntradaReciclagem, PapelUsuario, ParametroSistema, PerfilUsuario, Usuario
from app.schemas.entradas import EntradaReciclagemCriacao, EntradaReciclagemResposta

roteador = APIRouter(prefix="/reciclagem/entradas", tags=["Reciclagem"])


def _normalizar_material(material: str) -> str:
    texto = unicodedata.normalize("NFKD", material).encode("ascii", "ignore").decode("ascii")
    return " ".join(texto.lower().strip().split())


def _limite_maximo(sessao: Session, chave: str, valor_padrao: float) -> float:
    parametro = sessao.get(ParametroSistema, chave)
    if not parametro:
        return valor_padrao
    valor = parametro.valor_json.get("valor")
    return float(valor) if valor is not None else valor_padrao


def _eh_coordenador(usuario: Usuario) -> bool:
    return any(p.papel == PapelUsuario.coordinator for p in usuario.papeis)


@roteador.get("", response_model=list[EntradaReciclagemResposta])
def listar_entradas(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
    escola_id: UUID | None = None,
    de: date | None = Query(default=None),
    ate: date | None = Query(default=None),
) -> list[EntradaReciclagem]:
    filtros = []

    if not _eh_coordenador(usuario):
        if not perfil.escola_id:
            raise HTTPException(status_code=400, detail="Usuário sem escola vinculada.")
        filtros.append(EntradaReciclagem.escola_id == perfil.escola_id)
    elif escola_id:
        filtros.append(EntradaReciclagem.escola_id == escola_id)

    if de:
        filtros.append(EntradaReciclagem.data_lancamento >= de)
    if ate:
        filtros.append(EntradaReciclagem.data_lancamento <= ate)

    consulta = select(EntradaReciclagem)
    if filtros:
        consulta = consulta.where(and_(*filtros))
    consulta = consulta.order_by(EntradaReciclagem.data_lancamento.desc())
    return list(sessao.execute(consulta).scalars())


@roteador.post("", response_model=EntradaReciclagemResposta, status_code=201)
def criar_entrada(
    payload: EntradaReciclagemCriacao,
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> EntradaReciclagem:
    if not _eh_coordenador(usuario):
        if payload.escola_id != perfil.escola_id:
            raise HTTPException(status_code=403, detail="Você só pode registrar dados da sua escola.")

    limite_quantidade = _limite_maximo(sessao, "limite_maximo_quantidade", 100000)
    limite_co2 = _limite_maximo(sessao, "limite_maximo_co2_evitado", 1000000)

    if payload.quantidade > limite_quantidade:
        raise HTTPException(status_code=422, detail="Quantidade acima do limite configurado.")
    if payload.co2_evitado > limite_co2:
        raise HTTPException(status_code=422, detail="CO2 evitado acima do limite configurado.")

    entrada = EntradaReciclagem(
        escola_id=payload.escola_id,
        usuario_id=usuario.id,
        material=payload.material.strip(),
        material_normalizado=_normalizar_material(payload.material),
        quantidade=payload.quantidade,
        co2_evitado=payload.co2_evitado,
        data_lancamento=payload.data_lancamento,
    )
    sessao.add(entrada)
    sessao.commit()
    sessao.refresh(entrada)
    return entrada

