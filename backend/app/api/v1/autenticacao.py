import hashlib
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.configuracoes import configuracoes
from app.core.dependencias import obter_usuario_logado
from app.core.seguranca import (
    criar_token_acesso,
    criar_token_atualizacao,
    decodificar_token,
    gerar_hash_senha,
    validar_senha,
)
from app.models.modelos import PapelUsuario, PapelUsuarioDB, PerfilUsuario, TokenAtualizacao, Usuario
from app.schemas.autenticacao import (
    CadastroRequest,
    LoginRequest,
    RefreshRequest,
    TokensResposta,
    UsuarioResposta,
)

roteador = APIRouter(prefix="/autenticacao", tags=["Autenticação"])


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _para_usuario_resposta(usuario: Usuario) -> UsuarioResposta:
    return UsuarioResposta(
        id=usuario.id,
        email=usuario.email,
        nome_completo=usuario.perfil.nome_completo if usuario.perfil else "",
        escola_id=usuario.perfil.escola_id if usuario.perfil else None,
        papeis=[p.papel.value for p in usuario.papeis],
    )


@roteador.post("/cadastro", response_model=UsuarioResposta, status_code=201)
def cadastrar(
    payload: CadastroRequest,
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> UsuarioResposta:
    existente = sessao.execute(select(Usuario).where(Usuario.email == payload.email)).scalar_one_or_none()
    if existente:
        raise HTTPException(status_code=409, detail="Email já cadastrado.")

    usuario = Usuario(email=payload.email, senha_hash=gerar_hash_senha(payload.senha))
    sessao.add(usuario)
    sessao.flush()

    perfil = PerfilUsuario(
        usuario_id=usuario.id,
        nome_completo=payload.nome_completo,
        escola_id=payload.escola_id,
    )
    sessao.add(perfil)
    sessao.add(PapelUsuarioDB(usuario_id=usuario.id, papel=PapelUsuario.student))
    sessao.commit()
    sessao.refresh(usuario)
    return _para_usuario_resposta(usuario)


@roteador.post("/login", response_model=TokensResposta)
def login(
    payload: LoginRequest,
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> TokensResposta:
    usuario = sessao.execute(select(Usuario).where(Usuario.email == payload.email)).scalar_one_or_none()
    if not usuario or not validar_senha(payload.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo.")

    papeis = [p.papel.value for p in usuario.papeis] or [PapelUsuario.student.value]
    access_token = criar_token_acesso(str(usuario.id), papeis)
    refresh_token = criar_token_atualizacao(str(usuario.id))

    registro_refresh = TokenAtualizacao(
        usuario_id=usuario.id,
        token_hash=_hash_token(refresh_token),
        expira_em=datetime.now(UTC) + timedelta(days=configuracoes.jwt_refresh_expiracao_dias),
    )
    usuario.ultimo_login_em = datetime.now(UTC)
    sessao.add(registro_refresh)
    sessao.commit()

    return TokensResposta(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=configuracoes.jwt_expiracao_minutos * 60,
    )


@roteador.post("/atualizar-token", response_model=TokensResposta)
def atualizar_token(
    payload: RefreshRequest,
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> TokensResposta:
    try:
        dados = decodificar_token(payload.refresh_token)
    except ValueError as erro:
        raise HTTPException(status_code=401, detail="Refresh token inválido.") from erro

    if dados.get("tipo") != "atualizacao":
        raise HTTPException(status_code=401, detail="Refresh token inválido.")

    token_hash = _hash_token(payload.refresh_token)
    registro = sessao.execute(
        select(TokenAtualizacao).where(TokenAtualizacao.token_hash == token_hash)
    ).scalar_one_or_none()
    if not registro or registro.revogado_em is not None or registro.expira_em < datetime.now(UTC):
        raise HTTPException(status_code=401, detail="Refresh token expirado ou revogado.")

    usuario = sessao.get(Usuario, registro.usuario_id)
    if not usuario or not usuario.ativo:
        raise HTTPException(status_code=401, detail="Usuário inválido.")

    papeis = [p.papel.value for p in usuario.papeis] or [PapelUsuario.student.value]
    novo_access = criar_token_acesso(str(usuario.id), papeis)
    novo_refresh = criar_token_atualizacao(str(usuario.id))

    registro.revogado_em = datetime.now(UTC)
    sessao.add(
        TokenAtualizacao(
            usuario_id=usuario.id,
            token_hash=_hash_token(novo_refresh),
            expira_em=datetime.now(UTC) + timedelta(days=configuracoes.jwt_refresh_expiracao_dias),
        )
    )
    sessao.commit()

    return TokensResposta(
        access_token=novo_access,
        refresh_token=novo_refresh,
        expires_in=configuracoes.jwt_expiracao_minutos * 60,
    )


@roteador.post("/logout", status_code=204, response_class=Response)
def logout(
    payload: RefreshRequest,
    _: Annotated[Usuario, Depends(obter_usuario_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> Response:
    token_hash = _hash_token(payload.refresh_token)
    registro = sessao.execute(
        select(TokenAtualizacao).where(TokenAtualizacao.token_hash == token_hash)
    ).scalar_one_or_none()
    if registro and registro.revogado_em is None:
        registro.revogado_em = datetime.now(UTC)
        sessao.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

