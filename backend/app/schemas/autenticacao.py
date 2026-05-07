from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CadastroRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=8)
    nome_completo: str = Field(min_length=2, max_length=150)
    escola_id: UUID | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokensResposta(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UsuarioResposta(BaseModel):
    id: UUID
    email: EmailStr
    nome_completo: str
    escola_id: UUID | None = None
    papeis: list[str]

