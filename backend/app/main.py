from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from sqlalchemy.exc import IntegrityError

from app.api.v1.roteador import roteador_api_v1
from app.core.configuracoes import configuracoes
from app.core.erros import resposta_erro

limiter = Limiter(key_func=get_remote_address)


def criar_aplicacao() -> FastAPI:
    aplicacao = FastAPI(
        title="API OEP Sustentável",
        version="1.0.0",
        debug=configuracoes.debug,
    )

    origens = [origem.strip() for origem in configuracoes.cors_origens.split(",") if origem.strip()]
    aplicacao.add_middleware(
        CORSMiddleware,
        allow_origins=origens or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    aplicacao.state.limiter = limiter
    aplicacao.add_middleware(SlowAPIMiddleware)

    @aplicacao.exception_handler(RequestValidationError)
    async def _tratar_validacao(_: Request, erro: RequestValidationError):
        return resposta_erro(
            status_code=422,
            codigo="erro_validacao",
            mensagem="Dados inválidos.",
            detalhes=erro.errors(),
        )

    @aplicacao.exception_handler(IntegrityError)
    async def _tratar_integridade(_: Request, erro: IntegrityError):
        return resposta_erro(
            status_code=409,
            codigo="erro_integridade",
            mensagem="Conflito de dados.",
            detalhes=str(erro.orig),
        )

    @aplicacao.exception_handler(RateLimitExceeded)
    async def _tratar_limite(_: Request, __: RateLimitExceeded):
        return resposta_erro(
            status_code=429,
            codigo="limite_excedido",
            mensagem="Muitas requisições. Tente novamente em instantes.",
        )

    @aplicacao.get("/saude", tags=["Saúde"])
    @limiter.limit(configuracoes.limite_requisicoes_por_minuto)
    async def saude(request: Request):
        return {"status": "ok", "servico": "api-oep", "ambiente": configuracoes.ambiente}

    aplicacao.include_router(roteador_api_v1, prefix=configuracoes.prefixo_api)
    return aplicacao


app = criar_aplicacao()
