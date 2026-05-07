"""Seeds iniciais

Revision ID: 20260507_0002
Revises: 20260507_0001
Create Date: 2026-05-07 00:10:00
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260507_0002"
down_revision = "20260507_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            INSERT INTO escolas (id, nome, codigo, cidade)
            VALUES
              (gen_random_uuid(), 'Escola Elvira Brandão', 'elvira', 'Campo Grande'),
              (gen_random_uuid(), 'Escola Oswald Cruz', 'oswald', 'Campo Grande'),
              (gen_random_uuid(), 'Escola Piaget', 'piaget', 'Campo Grande'),
              (gen_random_uuid(), 'Escola Santo Antonio', 'santo-antonio', 'Campo Grande')
            ON CONFLICT (codigo) DO NOTHING;
            """
        )
    )

    op.execute(
        sa.text(
            """
            INSERT INTO parametros_sistema (chave, valor_json, versao)
            VALUES
              ('limite_maximo_quantidade', '{"valor": 100000}', 1),
              ('limite_maximo_co2_evitado', '{"valor": 1000000}', 1),
              ('limite_maximo_custo', '{"valor": 1000000}', 1),
              ('limite_maximo_consumo', '{"valor": 10000000}', 1),
              ('equivalencias_ambientais', '{"co2_por_arvore": 21.77, "co2_por_carga_smartphone": 0.008, "co2_por_km_onibus": 0.089}', 1)
            ON CONFLICT (chave) DO NOTHING;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM parametros_sistema WHERE chave IN ('limite_maximo_quantidade', 'limite_maximo_co2_evitado', 'limite_maximo_custo', 'limite_maximo_consumo', 'equivalencias_ambientais');"))
    op.execute(sa.text("DELETE FROM escolas WHERE codigo IN ('elvira', 'oswald', 'piaget', 'santo-antonio');"))

