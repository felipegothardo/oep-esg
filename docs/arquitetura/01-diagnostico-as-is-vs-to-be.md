# 1) Diagnóstico AS-IS vs TO-BE

## 1.1 Estado atual (AS-IS)

### Frontend
- Stack: React + TypeScript + Vite.
- Componente principal: `src/components/Dashboard.tsx`.
- Autenticação no cliente via `@supabase/supabase-js`.
- Camada de dados acoplada ao Supabase em `src/services/dataSync.ts`.
- Modo local alternativo existe, mas está desativado (`src/lib/runtimeMode.ts` define `isLocalMode = false`).

### Backend atual
- Não existe backend próprio em Python/FastAPI no repositório.
- Regras de acesso dependem de RLS e policies no Supabase.
- IA depende de Supabase Edge Function (`supabase/functions/ai-chat/index.ts`) e gateway Lovable.

### Banco atual
- Estrutura criada por migrations SQL do Supabase em `supabase/migrations`.
- Entidades principais já existentes: `schools`, `profiles`, `user_roles`, `recycling_entries`, `consumption_entries`, `consumption_goals`, `chat_messages`.
- Há referências a entidades adicionais em tipos e migrations (`notifications`, `alert_settings`, `external_data`).

### Tooling/Build
- Dependência `lovable-tagger` no `vite.config.ts` e `package.json`.
- Dependência direta de Supabase no frontend em múltiplos componentes.

## 1.2 Mapa de acoplamentos críticos

| Camada | Acoplamento atual | Evidência no código | Risco |
|---|---|---|---|
| Auth | Supabase Auth (`signInWithPassword`, `signUp`, sessão) | `src/pages/Auth.tsx`, `src/components/ProtectedRoute.tsx` | Alto |
| Banco | Supabase PostgREST (`from(...).select/insert/update/delete`) | `src/services/dataSync.ts`, `src/components/*` | Alto |
| RBAC | RLS e funções SQL (`has_role`, `get_user_school_id`) | `supabase/migrations/*.sql` | Alto |
| IA | Supabase Edge Function + `ai.gateway.lovable.dev` | `supabase/functions/ai-chat/index.ts`, `src/components/AIAssistant.tsx` | Alto |
| Deploy | Fluxo Lovable | `README.md` | Médio |
| Build Dev | `lovable-tagger` | `vite.config.ts` | Médio |

## 1.3 Lacunas para produção Azure

- Ausência de backend próprio versionado e testável (FastAPI).
- Ausência de estratégia de JWT/refresh fora do Supabase.
- Ausência de trilha de auditoria de alterações críticas.
- Ausência de pipeline CI/CD para Azure.
- Ausência de padronização formal de erros e contratos API versionados.
- Ausência de política operacional para edição retroativa por período.

## 1.4 TO-BE (resumo)

- Backend próprio em FastAPI + SQLAlchemy + Alembic.
- JWT com refresh token e RBAC no backend.
- Banco principal em Azure Database for PostgreSQL (tabelas em português).
- Endpoint de IA desacoplado de vendor via provider configurável em variável de ambiente.
- Frontend migrado para cliente HTTP tipado (feature flag para transição progressiva).
- Observabilidade e segurança operacional na Azure (Application Insights, Key Vault, rate limit).
