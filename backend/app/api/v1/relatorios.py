import csv
import io
from collections import defaultdict
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.banco import obter_sessao
from app.core.dependencias import obter_perfil_logado, obter_usuario_logado
from app.models.modelos import EntradaConsumo, EntradaReciclagem, Escola, PapelUsuario, PerfilUsuario, TipoConsumo, Usuario
from app.schemas.relatorios import DashboardEscolaResposta, PainelCoordenacaoResposta, RankingEscolaResposta
from app.services.calculos import (
    consumo_por_tipo,
    custo_por_tipo,
    pontuacao_ranking,
    total_co2_evitado,
    total_reciclado,
)

roteador = APIRouter(prefix="/relatorios", tags=["Relatórios"])


def _eh_coordenador(usuario: Usuario) -> bool:
    return any(p.papel == PapelUsuario.coordinator for p in usuario.papeis)


def _entradas_por_escola(sessao: Session, escola_id: UUID) -> tuple[list[EntradaReciclagem], list[EntradaConsumo]]:
    recicl = list(sessao.execute(select(EntradaReciclagem).where(EntradaReciclagem.escola_id == escola_id)).scalars())
    consumo = list(sessao.execute(select(EntradaConsumo).where(EntradaConsumo.escola_id == escola_id)).scalars())
    return (recicl, consumo)


@roteador.get("/dashboard-escola/{escola_id}", response_model=DashboardEscolaResposta)
def dashboard_escola(
    escola_id: UUID,
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> DashboardEscolaResposta:
    if not _eh_coordenador(usuario) and perfil.escola_id != escola_id:
        raise HTTPException(status_code=403, detail="Sem permissão para esta escola.")

    entradas_reciclagem, entradas_consumo = _entradas_por_escola(sessao, escola_id)
    return DashboardEscolaResposta(
        escola_id=escola_id,
        total_reciclado=total_reciclado(entradas_reciclagem),
        total_co2_evitado=total_co2_evitado(entradas_reciclagem),
        consumo_agua=consumo_por_tipo(entradas_consumo, TipoConsumo.agua),
        consumo_energia=consumo_por_tipo(entradas_consumo, TipoConsumo.energia),
        custo_agua=custo_por_tipo(entradas_consumo, TipoConsumo.agua),
        custo_energia=custo_por_tipo(entradas_consumo, TipoConsumo.energia),
    )


@roteador.get("/ranking", response_model=list[RankingEscolaResposta])
def ranking(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> list[RankingEscolaResposta]:
    escolas = list(sessao.execute(select(Escola).order_by(Escola.nome)).scalars())
    respostas: list[RankingEscolaResposta] = []

    for escola in escolas:
        if not _eh_coordenador(usuario) and perfil.escola_id != escola.id:
            continue

        recicl, _ = _entradas_por_escola(sessao, escola.id)
        total_r = total_reciclado(recicl)
        total_c = total_co2_evitado(recicl)
        respostas.append(
            RankingEscolaResposta(
                escola_id=escola.id,
                nome_escola=escola.nome,
                total_reciclado=total_r,
                total_co2_evitado=total_c,
                pontuacao=pontuacao_ranking(total_r, total_c),
            )
        )

    respostas.sort(
        key=lambda item: (-item.pontuacao, -item.total_co2_evitado, item.nome_escola.lower())
    )
    return respostas


@roteador.get("/painel-coordenacao", response_model=PainelCoordenacaoResposta)
def painel_coordenacao(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> PainelCoordenacaoResposta:
    if not _eh_coordenador(usuario):
        raise HTTPException(status_code=403, detail="Acesso restrito a coordenadores.")

    ranking_lista = ranking(usuario=usuario, perfil=usuario.perfil, sessao=sessao)
    totais = {
        "total_reciclado": round(sum(r.total_reciclado for r in ranking_lista), 2),
        "total_co2_evitado": round(sum(r.total_co2_evitado for r in ranking_lista), 2),
    }

    comparativo = []
    for item in ranking_lista:
        _, entradas_consumo = _entradas_por_escola(sessao, item.escola_id)
        comparativo.append(
            {
                "escola_id": str(item.escola_id),
                "nome_escola": item.nome_escola,
                "reciclagem": item.total_reciclado,
                "co2": item.total_co2_evitado,
                "agua": consumo_por_tipo(entradas_consumo, TipoConsumo.agua),
                "energia": consumo_por_tipo(entradas_consumo, TipoConsumo.energia),
            }
        )

    return PainelCoordenacaoResposta(totais=totais, ranking=ranking_lista, comparativo=comparativo)


@roteador.get("/exportar/csv")
def exportar_csv(
    usuario: Annotated[Usuario, Depends(obter_usuario_logado)],
    perfil: Annotated[PerfilUsuario, Depends(obter_perfil_logado)],
    sessao: Annotated[Session, Depends(obter_sessao)],
) -> Response:
    ranking_lista = ranking(usuario=usuario, perfil=perfil, sessao=sessao)
    buffer = io.StringIO()
    escritor = csv.writer(buffer)
    escritor.writerow(["posicao", "escola", "total_reciclado", "total_co2_evitado", "pontuacao"])
    for indice, item in enumerate(ranking_lista, start=1):
        escritor.writerow(
            [
                indice,
                item.nome_escola,
                f"{item.total_reciclado:.2f}",
                f"{item.total_co2_evitado:.2f}",
                f"{item.pontuacao:.2f}",
            ]
        )

    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="ranking-escolas.csv"'},
    )


@roteador.get("/exportar/pdf")
def exportar_pdf_stub() -> Response:
    # Implementação definitiva pode usar WeasyPrint ou serviço externo de renderização.
    conteudo = b"%PDF-1.4\n% Implementacao pendente\n"
    return Response(
        content=conteudo,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="relatorio.pdf"'},
    )

