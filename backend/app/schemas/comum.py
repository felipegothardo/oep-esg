from pydantic import BaseModel


class ErroPadrao(BaseModel):
    codigo: str
    mensagem: str
    detalhes: dict | list | str | None = None
    correlation_id: str | None = None

