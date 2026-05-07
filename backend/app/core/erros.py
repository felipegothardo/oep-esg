from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError


def resposta_erro(
    status_code: int,
    codigo: str,
    mensagem: str,
    detalhes: dict | list | str | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "codigo": codigo,
            "mensagem": mensagem,
            "detalhes": detalhes,
        },
    )


async def tratar_erro_validacao(_: Request, erro: ValidationError) -> JSONResponse:
    return resposta_erro(
        status_code=422,
        codigo="erro_validacao",
        mensagem="Dados inválidos.",
        detalhes=erro.errors(),
    )


async def tratar_erro_integridade(_: Request, erro: IntegrityError) -> JSONResponse:
    return resposta_erro(
        status_code=409,
        codigo="erro_integridade",
        mensagem="Conflito de dados.",
        detalhes=str(erro.orig),
    )

