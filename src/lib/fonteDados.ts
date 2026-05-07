export type FonteDadosModo = "supabase" | "api" | "hibrido" | "local";

const modoRaw = (import.meta.env.VITE_FONTE_DADOS || "supabase").toLowerCase();

export const fonteDadosModo: FonteDadosModo =
  modoRaw === "api" || modoRaw === "hibrido" || modoRaw === "local"
    ? (modoRaw as FonteDadosModo)
    : "supabase";

export const usarApiPropria = fonteDadosModo === "api" || fonteDadosModo === "hibrido";
export const usarSupabase = fonteDadosModo === "supabase" || fonteDadosModo === "hibrido";
export const usarModoLocal = fonteDadosModo === "local";

