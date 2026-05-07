from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.dependencias import exigir_papeis
from app.models.modelos import PapelUsuario, PapelUsuarioDB, Usuario
from app.schemas.autenticacao import UsuarioResposta

roteador = APIRouter(prefix="/usuarios", tags=["Usuários"])


class AlterarPapelRequest(BaseModel):
    papel: PapelUsuario


def _para_usuario_resposta(usuario: Usuario) -> UsuarioResposta:
    return UsuarioResposta(
        id=usuario.id,
        email=usuario.email,
        nome_completo=usuario.perfil.nome_completo if usuario.perfil else "",
        escola_id=usuario.perfil.escola_id if usuario.perfil else None,
        papeis=[p.papel.value for p in usuario.papeis],
    )


@roteador.get("", response_model=list[UsuarioResposta])
def listar_usuarios(
    _: Annotated[Usuario, Depends(exigir_papeis(PapelUsuario.coordinator))],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> list[UsuarioResposta]:
    usuarios = list(sessao.execute(select(Usuario).order_by(Usuario.criado_em.desc())).scalars())
    return [_para_usuario_resposta(u) for u in usuarios]


@roteador.patch("/{usuario_id}/papel", response_model=UsuarioResposta)
def alterar_papel(
    usuario_id: UUID,
    payload: AlterarPapelRequest,
    _: Annotated[Usuario, Depends(exigir_papeis(PapelUsuario.coordinator))],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> UsuarioResposta:
    usuario = sessao.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Mantém apenas um papel principal para simplificar governança.
    for papel_existente in list(usuario.papeis):
        sessao.delete(papel_existente)
    sessao.add(PapelUsuarioDB(usuario_id=usuario.id, papel=payload.papel))
    sessao.commit()
    sessao.refresh(usuario)
    return _para_usuario_resposta(usuario)

