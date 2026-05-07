from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.configuracoes import configuracoes
from app.core.seguranca import decodificar_token
from app.models.modelos import PapelUsuario, PerfilUsuario, Usuario


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{configuracoes.prefixo_api}/autenticacao/login")


def _erro_nao_autenticado() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autenticado.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def obter_usuario_logado(
    token: Annotated[str, Depends(oauth2_scheme)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> Usuario:
    try:
        payload = decodificar_token(token)
    except ValueError as erro:
        raise _erro_nao_autenticado() from erro

    if payload.get("tipo") != "acesso":
        raise _erro_nao_autenticado()

    try:
        usuario_id = UUID(payload["sub"])
    except Exception as erro:
        raise _erro_nao_autenticado() from erro

    usuario = sessao.get(Usuario, usuario_id)
    if not usuario or not usuario.ativo:
        raise _erro_nao_autenticado()
    return usuario


def obter_perfil_logado(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> PerfilUsuario:
    consulta = select(PerfilUsuario).where(PerfilUsuario.usuario_id == usuario.id)
    perfil = sessao.execute(consulta).scalar_one_or_none()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil do usuário não encontrado.")
    return perfil


def exigir_papeis(*papeis_permitidos: PapelUsuario):
    def _validador(
        usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    ) -> Usuario:
        papeis_usuario = {papel.papel for papel in usuario.papeis}
        if not papeis_usuario.intersection(set(papeis_permitidos)):
            raise HTTPException(status_code=403, detail="Sem permissão para esta operação.")
        return usuario

    return _validador

