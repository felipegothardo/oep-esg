import httpx

from app.core.configuracoes import configuracoes
from app.schemas.ia import IAChatRequest


async def responder_chat_ia(payload: IAChatRequest) -> tuple[str, str]:
    provedor = configuracoes.provedor_ia.lower()

    if provedor == "mock":
        ultimo = payload.mensagens[-1].content if payload.mensagens else ""
        return (f"Resposta simulada do assistente: {ultimo}", "mock")

    if provedor == "openai_compat":
        if not configuracoes.chave_api_ia or not configuracoes.url_base_ia:
            raise RuntimeError("Configuração de IA incompleta.")

        async with httpx.AsyncClient(timeout=30) as cliente:
            resposta = await cliente.post(
                f"{configuracoes.url_base_ia.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {configuracoes.chave_api_ia}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": configuracoes.modelo_ia,
                    "messages": [m.model_dump() for m in payload.mensagens],
                    "temperature": 0.3,
                },
            )
            resposta.raise_for_status()
            dados = resposta.json()
            conteudo = dados["choices"][0]["message"]["content"]
            return (conteudo, "openai_compat")

    raise RuntimeError(f"Provedor de IA não suportado: {provedor}")

