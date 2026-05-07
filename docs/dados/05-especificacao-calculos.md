# 5) Calculation Specification (Especificação Oficial de Cálculos)

## 5.1 Convenções gerais

- Fuso horário padrão: `America/Sao_Paulo`.
- Moeda/custos: arredondamento em 2 casas.
- Métricas ambientais: arredondamento em 2 casas.
- Entradas inválidas não entram em cálculo (retornar erro 422).

## 5.2 Fórmulas oficiais

## Totais principais
- `total_reciclado = soma(quantidade)` de `entradas_reciclagem`.
- `total_co2_evitado = soma(co2_evitado)` de `entradas_reciclagem`.
- `consumo_agua = soma(consumo onde tipo='agua')`.
- `consumo_energia = soma(consumo onde tipo='energia')`.
- `custo_agua = soma(custo onde tipo='agua')`.
- `custo_energia = soma(custo onde tipo='energia')`.

## Redução percentual atual
- Definição por tipo (`agua`/`energia`) e escola:
  - `consumo_mes_atual = consumo do mês mais recente`.
  - `consumo_mes_anterior = consumo do mês imediatamente anterior`.
  - `reducao_atual_percentual = ((consumo_mes_anterior - consumo_mes_atual) / consumo_mes_anterior) * 100`.
  - Se `consumo_mes_anterior = 0`, então `reducao_atual_percentual = 0`.

## Ranking oficial
- `pontuacao = total_reciclado * 0.5 + total_co2_evitado * 10`.
- Ordenação: `pontuacao desc`, empate por `total_co2_evitado desc`, depois `nome_escola asc`.

## 5.3 Equivalências ambientais (configuráveis e versionadas)

Constantes obrigatórias em `parametros_sistema`:
- `co2_por_arvore = 21.77`
- `co2_por_carga_smartphone = 0.008`
- `co2_por_km_onibus = 0.089`

Fórmulas:
- `arvores_equivalentes = total_co2_evitado / co2_por_arvore`
- `cargas_smartphone_equivalentes = total_co2_evitado / co2_por_carga_smartphone`
- `km_onibus_equivalentes = total_co2_evitado / co2_por_km_onibus`

## 5.4 Regras de consolidação para evitar dupla contagem

- Base de consolidação por `id` da entrada.
- Em modo de migração dual-write, usar `chave_origem_externa` (quando disponível) para deduplicação.
- Relatórios consolidados sempre agregam por escola e período sem somar linhas repetidas.

## 5.5 Política de edição retroativa

- Até 60 dias: edição permitida para autor, `teacher` e `coordinator`.
- Acima de 60 dias:
  - `student` bloqueado;
  - `teacher` bloqueado;
  - `coordinator` permitido com log obrigatório em `auditoria_alteracoes`.
