export interface ErroApi {
  codigo: string;
  mensagem: string;
  detalhes?: unknown;
  correlation_id?: string;
}

export interface TokensResposta {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface EntradaReciclagemApi {
  id: string;
  escola_id: string;
  usuario_id: string;
  material: string;
  material_normalizado: string;
  quantidade: number;
  co2_evitado: number;
  data_lancamento: string;
}

export interface EntradaConsumoApi {
  id: string;
  escola_id: string;
  usuario_id: string;
  tipo: "agua" | "energia";
  mes_referencia: string;
  custo: number;
  consumo: number;
  data_lancamento: string;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const apiPrefixo = import.meta.env.VITE_API_PREFIXO || "/api/v1";
const apiUrl = `${apiBaseUrl}${apiPrefixo}`;

function obterTokenAcesso(): string | null {
  return localStorage.getItem("oep_api_access_token");
}

function salvarTokens(tokens: TokensResposta) {
  localStorage.setItem("oep_api_access_token", tokens.access_token);
  localStorage.setItem("oep_api_refresh_token", tokens.refresh_token);
}

async function requisicao<T>(
  caminho: string,
  init?: RequestInit,
  autenticado = true
): Promise<T> {
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");

  if (autenticado) {
    const token = obterTokenAcesso();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const resposta = await fetch(`${apiUrl}${caminho}`, {
    ...init,
    headers,
  });

  if (!resposta.ok) {
    const erro = (await resposta.json().catch(() => null)) as ErroApi | null;
    throw new Error(erro?.mensagem || `Erro HTTP ${resposta.status}`);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}

export const apiCliente = {
  async login(email: string, senha: string): Promise<TokensResposta> {
    const tokens = await requisicao<TokensResposta>(
      "/autenticacao/login",
      { method: "POST", body: JSON.stringify({ email, senha }) },
      false
    );
    salvarTokens(tokens);
    return tokens;
  },

  async cadastro(payload: {
    email: string;
    senha: string;
    nome_completo: string;
    escola_id: string;
  }) {
    return requisicao("/autenticacao/cadastro", {
      method: "POST",
      body: JSON.stringify(payload),
    }, false);
  },

  async listarEscolas() {
    return requisicao("/escolas");
  },

  async listarEntradasReciclagem(): Promise<EntradaReciclagemApi[]> {
    return requisicao("/reciclagem/entradas");
  },

  async criarEntradaReciclagem(payload: Omit<EntradaReciclagemApi, "id" | "usuario_id" | "material_normalizado">) {
    return requisicao<EntradaReciclagemApi>("/reciclagem/entradas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async listarEntradasConsumo(): Promise<EntradaConsumoApi[]> {
    return requisicao("/consumo/entradas");
  },

  async criarEntradaConsumo(payload: Omit<EntradaConsumoApi, "id" | "usuario_id">) {
    return requisicao<EntradaConsumoApi>("/consumo/entradas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async ranking() {
    return requisicao("/relatorios/ranking");
  },
};

