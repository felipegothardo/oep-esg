from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.dependencias import obter_usuario_logado
from app.models.modelos import Usuario
from app.schemas.ia import IAChatRequest, IAChatResposta
from app.services.ia.provedor import responder_chat_ia

roteador = APIRouter(prefix="/ia", tags=["IA"])


@roteador.post("/chat", response_model=IAChatResposta)
async def chat_ia(
    payload: IAChatRequest,
    _: Annotated[Usuario, Depends(obter_usuario_logado)],
    __: Annotated[Session, Depends(obter_sessao)],
) -> IAChatResposta:
    try:
        resposta, provedor = await responder_chat_ia(payload)
        return IAChatResposta(resposta=resposta, provedor=provedor)
    except Exception as erro:
        raise HTTPException(status_code=500, detail=f"Falha no serviço de IA: {erro}") from erro

