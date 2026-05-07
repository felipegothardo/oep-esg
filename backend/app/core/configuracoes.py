from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracoes(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    ambiente: str = Field(default="desenvolvimento")
    debug: bool = Field(default=True)
    prefixo_api: str = Field(default="/api/v1")

    # Banco (Azure Database for PostgreSQL)
    url_banco_dados: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/oep_esg"
    )

    # Segurança/JWT
    jwt_chave_secreta: str = Field(default="trocar-em-producao")
    jwt_algoritmo: str = Field(default="HS256")
    jwt_expiracao_minutos: int = Field(default=30)
    jwt_refresh_expiracao_dias: int = Field(default=15)

    # CORS
    cors_origens: str = Field(default="http://localhost:5173,http://localhost:8080")

    # Rate limit
    limite_requisicoes_por_minuto: str = Field(default="120/minute")

    # IA desacoplada
    provedor_ia: str = Field(default="mock")
    chave_api_ia: str | None = Field(default=None)
    modelo_ia: str = Field(default="gpt-4o-mini")
    url_base_ia: str | None = Field(default=None)

    # Operacional
    fuso_horario_padrao: str = Field(default="America/Sao_Paulo")


configuracoes = Configuracoes()

