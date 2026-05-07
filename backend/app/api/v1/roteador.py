from fastapi import APIRouter

from app.api.v1.autenticacao import roteador as roteador_autenticacao
from app.api.v1.consumo import roteador as roteador_consumo
from app.api.v1.escolas import roteador as roteador_escolas
from app.api.v1.ia import roteador as roteador_ia
from app.api.v1.reciclagem import roteador as roteador_reciclagem
from app.api.v1.relatorios import roteador as roteador_relatorios
from app.api.v1.usuarios import roteador as roteador_usuarios

roteador_api_v1 = APIRouter()
roteador_api_v1.include_router(roteador_autenticacao)
roteador_api_v1.include_router(roteador_escolas)
roteador_api_v1.include_router(roteador_usuarios)
roteador_api_v1.include_router(roteador_reciclagem)
roteador_api_v1.include_router(roteador_consumo)
roteador_api_v1.include_router(roteador_relatorios)
roteador_api_v1.include_router(roteador_ia)

