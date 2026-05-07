from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.configuracoes import configuracoes


contexto_senha = CryptContext(schemes=["bcrypt"], deprecated="auto")


def gerar_hash_senha(senha: str) -> str:
    return contexto_senha.hash(senha)


def validar_senha(senha_plana: str, hash_senha: str) -> bool:
    return contexto_senha.verify(senha_plana, hash_senha)


def _criar_token(dados: dict[str, Any], expira_em: timedelta) -> str:
    payload = dados.copy()
    payload["exp"] = datetime.now(UTC) + expira_em
    return jwt.encode(
        payload, configuracoes.jwt_chave_secreta, algorithm=configuracoes.jwt_algoritmo
    )


def criar_token_acesso(assunto: str, papeis: list[str]) -> str:
    return _criar_token(
        dados={"sub": assunto, "tipo": "acesso", "papeis": papeis},
        expira_em=timedelta(minutes=configuracoes.jwt_expiracao_minutos),
    )


def criar_token_atualizacao(assunto: str) -> str:
    return _criar_token(
        dados={"sub": assunto, "tipo": "atualizacao"},
        expira_em=timedelta(days=configuracoes.jwt_refresh_expiracao_dias),
    )


def decodificar_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            configuracoes.jwt_chave_secreta,
            algorithms=[configuracoes.jwt_algoritmo],
        )
    except JWTError as erro:
        raise ValueError("Token inválido") from erro

