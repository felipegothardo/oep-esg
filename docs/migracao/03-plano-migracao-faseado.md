# 3) Plano de Migração Faseado (MVP -> Estabilização -> Hardening)

## 3.1 Fase 0 - Preparação (1 a 2 semanas)
- Congelar mudanças estruturais no Supabase (apenas hotfix).
- Inventário de dados e validação de qualidade.
- Criar backend FastAPI base, migrations Alembic e contratos `/api/v1`.
- Criar feature flags no frontend para alternar fonte de dados.

### Rollback
- Sem impacto em produção: frontend permanece em Supabase.

## 3.2 Fase 1 - MVP em paralelo (2 a 4 semanas)
- Subir API FastAPI em ambiente de homologação Azure.
- Criar banco PostgreSQL com tabelas em português.
- Executar carga inicial (snapshot) dos dados do Supabase.
- Ativar modo `hibrido`:
  - leitura por API em módulos de menor risco;
  - escrita ainda no Supabase (ou dual-write controlado).

### Rollback
- Toggle para `supabase` no frontend.
- API permanece passiva para correções.

## 3.3 Fase 2 - Estabilização (2 a 3 semanas)
- Migrar escrita principal para API (`api`).
- Habilitar dual-write temporário para validação cruzada.
- Executar reconciliação diária (contagem, somatórios, ranking).
- Migrar autenticação para JWT próprio e refresh token.

### Rollback
- Voltar para `hibrido` ou `supabase` via flag.
- Reprocessar delta com jobs de sincronização.

## 3.4 Fase 3 - Hardening e Cutover final (2 semanas)
- Desativar chamadas Supabase no frontend.
- Remover dependências `@supabase/supabase-js` e `lovable-tagger`.
- Revisar performance, segurança, testes de carga e observabilidade.
- Publicar versão final em produção Azure.

### Rollback
- Janela controlada de contingência (feature flag + branch release).
- Backup lógico do PostgreSQL antes do cutover.

## 3.5 Estratégia de migração de dados

1. Exportar Supabase em lotes por tabela.
2. Transformar campos:
   - `month` de `MM/YYYY` para `YYYY-MM`;
   - normalização de `material`;
   - validação de outliers.
3. Carga idempotente com `UPSERT`.
4. Validação pós-carga:
   - totais por escola;
   - totais de CO2;
   - ranking.
5. Corte incremental por data/hora (`watermark`).

## 3.6 Critérios de saída por fase

- Fase 1 -> 2:
  - 100% endpoints críticos implementados;
  - divergência de relatórios < 0,5%.
- Fase 2 -> 3:
  - sem erro crítico por 7 dias;
  - latência p95 < 400ms em operações comuns;
  - taxa de erro 5xx < 0,5%.
