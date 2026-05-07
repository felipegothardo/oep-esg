from pydantic import BaseModel, Field


class MensagemIA(BaseModel):
    role: str = Field(pattern="^(system|user|assistant)$")
    content: str = Field(min_length=1)


class IAChatRequest(BaseModel):
    mensagens: list[MensagemIA]


class IAChatResposta(BaseModel):
    resposta: str
    provedor: str

