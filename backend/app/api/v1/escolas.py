from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.dependencias import exigir_papeis
from app.models.modelos import Escola, PapelUsuario, Usuario
from app.schemas.escolas import EscolaCriacao, EscolaResposta

roteador = APIRouter(prefix="/escolas", tags=["Escolas"])


@roteador.get("", response_model=list[EscolaResposta])
def listar_escolas(sessao: Annotated[Session, Depends(obter_sessao)]) -> list[Escola]:
    return list(sessao.execute(select(Escola).order_by(Escola.nome)).scalars())


@roteador.post("", response_model=EscolaResposta, status_code=201)
def criar_escola(
    payload: EscolaCriacao,
    _: Annotated[Usuario, Depends(exigir_papeis(PapelUsuario.coordinator))],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> Escola:
    escola = Escola(
        nome=payload.nome.strip(),
        codigo=payload.codigo.strip().lower(),
        cidade=payload.cidade.strip() if payload.cidade else None,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    sessao.add(escola)
    sessao.commit()
    sessao.refresh(escola)
    return escola

