"""
Migração de dados Supabase -> PostgreSQL (tabelas PT-BR).

Uso sugerido:
  python scripts/migrar_supabase_para_postgres.py --origem ./export_supabase --url postgres://...
"""

from __future__ import annotations

import argparse
import csv
import uuid
from pathlib import Path

from sqlalchemy import create_engine, text


def ler_csv(caminho: Path) -> list[dict]:
    if not caminho.exists():
        return []
    with caminho.open("r", encoding="utf-8", newline="") as arquivo:
        return list(csv.DictReader(arquivo))


def normalizar_mes(valor: str) -> str:
    # MM/YYYY -> YYYY-MM
    valor = (valor or "").strip()
    if len(valor) == 7 and "/" in valor:
        mes, ano = valor.split("/")
        return f"{ano}-{mes}"
    return valor


def executar_migracao(pasta_origem: Path, url_banco: str) -> None:
    engine = create_engine(url_banco, future=True)

    escolas = ler_csv(pasta_origem / "schools.csv")
    perfis = ler_csv(pasta_origem / "profiles.csv")
    papeis = ler_csv(pasta_origem / "user_roles.csv")
    reciclagem = ler_csv(pasta_origem / "recycling_entries.csv")
    consumo = ler_csv(pasta_origem / "consumption_entries.csv")
    metas = ler_csv(pasta_origem / "consumption_goals.csv")

    with engine.begin() as conn:
        for escola in escolas:
            conn.execute(
                text(
                    """
                    INSERT INTO escolas (id, nome, codigo, cidade, latitude, longitude)
                    VALUES (:id, :nome, :codigo, :cidade, :latitude, :longitude)
                    ON CONFLICT (id) DO UPDATE SET
                      nome = EXCLUDED.nome,
                      codigo = EXCLUDED.codigo,
                      cidade = EXCLUDED.cidade,
                      latitude = EXCLUDED.latitude,
                      longitude = EXCLUDED.longitude
                    """
                ),
                {
                    "id": escola["id"],
                    "nome": escola.get("name"),
                    "codigo": escola.get("code"),
                    "cidade": escola.get("city"),
                    "latitude": escola.get("latitude"),
                    "longitude": escola.get("longitude"),
                },
            )

        # Observação: auth.users não é exportado diretamente.
        # O script assume que usuários já foram provisionados em `usuarios`
        # e mapeados por id legado.
        for perfil in perfis:
            conn.execute(
                text(
                    """
                    INSERT INTO perfis_usuario (id, usuario_id, nome_completo, escola_id)
                    VALUES (:id, :usuario_id, :nome_completo, :escola_id)
                    ON CONFLICT (usuario_id) DO UPDATE SET
                      nome_completo = EXCLUDED.nome_completo,
                      escola_id = EXCLUDED.escola_id
                    """
                ),
                {
                    "id": perfil.get("id") or str(uuid.uuid4()),
                    "usuario_id": perfil["user_id"],
                    "nome_completo": perfil.get("full_name") or "",
                    "escola_id": perfil.get("school_id"),
                },
            )

        for papel in papeis:
            conn.execute(
                text(
                    """
                    INSERT INTO papeis_usuario (id, usuario_id, papel)
                    VALUES (:id, :usuario_id, :papel)
                    ON CONFLICT (usuario_id, papel) DO NOTHING
                    """
                ),
                {
                    "id": papel.get("id") or str(uuid.uuid4()),
                    "usuario_id": papel["user_id"],
                    "papel": papel["role"],
                },
            )

        for entrada in reciclagem:
            material = (entrada.get("material") or "").strip()
            conn.execute(
                text(
                    """
                    INSERT INTO entradas_reciclagem (
                      id, escola_id, usuario_id, material, material_normalizado,
                      quantidade, co2_evitado, data_lancamento
                    )
                    VALUES (
                      :id, :escola_id, :usuario_id, :material, :material_normalizado,
                      :quantidade, :co2_evitado, :data_lancamento
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": entrada["id"],
                    "escola_id": entrada["school_id"],
                    "usuario_id": entrada["user_id"],
                    "material": material,
                    "material_normalizado": material.lower(),
                    "quantidade": entrada["quantity"],
                    "co2_evitado": entrada["co2_saved"],
                    "data_lancamento": entrada["entry_date"],
                },
            )

        for entrada in consumo:
            tipo = "agua" if entrada.get("type") == "water" else "energia"
            conn.execute(
                text(
                    """
                    INSERT INTO entradas_consumo (
                      id, escola_id, usuario_id, tipo, mes_referencia,
                      custo, consumo, data_lancamento
                    )
                    VALUES (
                      :id, :escola_id, :usuario_id, :tipo, :mes_referencia,
                      :custo, :consumo, :data_lancamento
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": entrada["id"],
                    "escola_id": entrada["school_id"],
                    "usuario_id": entrada["user_id"],
                    "tipo": tipo,
                    "mes_referencia": normalizar_mes(entrada.get("month", "")),
                    "custo": entrada["cost"],
                    "consumo": entrada["consumption"],
                    "data_lancamento": entrada["entry_date"],
                },
            )

        for meta in metas:
            tipo = "agua" if meta.get("type") == "water" else "energia"
            conn.execute(
                text(
                    """
                    INSERT INTO metas_consumo (id, escola_id, tipo, percentual_reducao)
                    VALUES (:id, :escola_id, :tipo, :percentual_reducao)
                    ON CONFLICT (escola_id, tipo) DO UPDATE SET
                      percentual_reducao = EXCLUDED.percentual_reducao
                    """
                ),
                {
                    "id": meta.get("id") or str(uuid.uuid4()),
                    "escola_id": meta["school_id"],
                    "tipo": tipo,
                    "percentual_reducao": meta["reduction_percentage"],
                },
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--origem", required=True, help="Pasta com CSVs exportados do Supabase.")
    parser.add_argument("--url", required=True, help="URL SQLAlchemy do PostgreSQL de destino.")
    args = parser.parse_args()
    executar_migracao(Path(args.origem), args.url)
    print("Migração concluída.")


if __name__ == "__main__":
    main()

