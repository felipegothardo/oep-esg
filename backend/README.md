# Backend OEP Sustentável (FastAPI)

## Executar local

1. Criar ambiente virtual e instalar dependências:
```bash
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
```

2. Configurar variáveis:
```bash
cp .env.exemplo .env
```

3. Rodar migrations:
```bash
alembic upgrade head
```

4. Subir API:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Estrutura

- `app/main.py`: inicialização FastAPI, CORS, rate limit e roteamento.
- `app/api/v1`: rotas versionadas (`/api/v1`).
- `app/models`: modelos SQLAlchemy.
- `app/schemas`: contratos Pydantic.
- `app/services`: cálculos e serviços de domínio.
- `alembic`: controle de schema e seeds versionados.

## Observações de migração

- Tabelas de banco estão em português.
- Papéis preservados: `coordinator`, `teacher`, `student`.
- Endpoints de IA são desacoplados via `PROVEDOR_IA`.
