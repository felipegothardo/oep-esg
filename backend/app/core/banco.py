from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.configuracoes import configuracoes


motor = create_engine(configuracoes.url_banco_dados, pool_pre_ping=True, future=True)
SessaoLocal = sessionmaker(bind=motor, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def obter_sessao() -> Generator[Session, None, None]:
    sessao = SessaoLocal()
    try:
        yield sessao
    finally:
        sessao.close()

