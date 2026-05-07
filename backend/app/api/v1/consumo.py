from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.dependencias import obter_perfil_logado, obter_usuario_logado
from app.models.modelos import (
    EntradaConsumo,
    MetaConsumo,
    PapelUsuario,
    ParametroSistema,
    PerfilUsuario,
    TipoConsumo,
    Usuario,
)
from app.schemas.entradas import (
    EntradaConsumoCriacao,
    EntradaConsumoResposta,
    MetaConsumoRequest,
    MetaConsumoResposta,
)

roteador = APIRouter(prefix="/consumo", tags=["Consumo"])


def _eh_coordenador(usuario: Usuario) -> bool:
    return any(p.papel == PapelUsuario.coordinator for p in usuario.papeis)


def _limite_maximo(sessao: Session, chave: str, valor_padrao: float) -> float:
    parametro = sessao.get(ParametroSistema, chave)
    if not parametro:
        return valor_padrao
    valor = parametro.valor_json.get("valor")
    return float(valor) if valor is not None else valor_padrao


@roteador.get("/entradas", response_model=list[EntradaConsumoResposta])
def listar_entradas(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
    escola_id: UUID | None = None,
    tipo: TipoConsumo | None = Query(default=None),
) -> list[EntradaConsumo]:
    filtros = []
    if not _eh_coordenador(usuario):
        if not perfil.escola_id:
            raise HTTPException(status_code=400, detail="Usuário sem escola vinculada.")
        filtros.append(EntradaConsumo.escola_id == perfil.escola_id)
    elif escola_id:
        filtros.append(EntradaConsumo.escola_id == escola_id)

    if tipo:
        filtros.append(EntradaConsumo.tipo == tipo)

    consulta = select(EntradaConsumo)
    if filtros:
        consulta = consulta.where(and_(*filtros))
    consulta = consulta.order_by(EntradaConsumo.mes_referencia.desc())
    return list(sessao.execute(consulta).scalars())


@roteador.post("/entradas", response_model=EntradaConsumoResposta, status_code=201)
def criar_entrada(
    payload: EntradaConsumoCriacao,
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> EntradaConsumo:
    if not _eh_coordenador(usuario):
        if payload.escola_id != perfil.escola_id:
            raise HTTPException(status_code=403, detail="Você só pode registrar dados da sua escola.")

    limite_custo = _limite_maximo(sessao, "limite_maximo_custo", 1000000)
    limite_consumo = _limite_maximo(sessao, "limite_maximo_consumo", 10000000)
    if payload.custo > limite_custo:
        raise HTTPException(status_code=422, detail="Custo acima do limite configurado.")
    if payload.consumo > limite_consumo:
        raise HTTPException(status_code=422, detail="Consumo acima do limite configurado.")

    entrada = EntradaConsumo(
        escola_id=payload.escola_id,
        usuario_id=usuario.id,
        tipo=payload.tipo,
        mes_referencia=payload.mes_referencia,
        custo=payload.custo,
        consumo=payload.consumo,
        data_lancamento=payload.data_lancamento,
    )
    sessao.add(entrada)
    sessao.commit()
    sessao.refresh(entrada)
    return entrada


@roteador.get("/metas", response_model=list[MetaConsumoResposta])
def listar_metas(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> list[MetaConsumo]:
    if _eh_coordenador(usuario):
        consulta = select(MetaConsumo).order_by(MetaConsumo.escola_id, MetaConsumo.tipo)
    else:
        consulta = select(MetaConsumo).where(MetaConsumo.escola_id == perfil.escola_id).order_by(MetaConsumo.tipo)
    return list(sessao.execute(consulta).scalars())


@roteador.put("/metas", response_model=MetaConsumoResposta)
def upsert_meta(
    payload: MetaConsumoRequest,
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> MetaConsumo:
    if not _eh_coordenador(usuario) and payload.escola_id != perfil.escola_id:
        raise HTTPException(status_code=403, detail="Sem permissão para alterar meta de outra escola.")

    consulta = select(MetaConsumo).where(
        MetaConsumo.escola_id == payload.escola_id, MetaConsumo.tipo == payload.tipo
    )
    meta = sessao.execute(consulta).scalar_one_or_none()
    if not meta:
        meta = MetaConsumo(
            escola_id=payload.escola_id,
            tipo=payload.tipo,
            percentual_reducao=payload.percentual_reducao,
        )
        sessao.add(meta)
    else:
        meta.percentual_reducao = payload.percentual_reducao

    sessao.commit()
    sessao.refresh(meta)
    return meta

