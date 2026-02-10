
# Correcao de Bugs e Redesign Visual do Dashboard

## 1. Correcao de Bugs nas Abas (Tab Navigation)

**Problema identificado:** O `SchoolDashboard` usa o componente `Tabs` do Radix UI com `value` e `onValueChange` controlados, mas a pagina de autenticacao (`Auth.tsx`) usa `defaultValue` (nao controlado). O bug nas abas do dashboard pode estar relacionado a conflitos entre o estado controlado e re-renders causados por chamadas assincronas (ex: `onRecyclingUpdate`, `onConsumptionUpdate`).

**Solucao:**
- Garantir que o `Tabs` no `SchoolDashboard` use `key` estavel para evitar re-mounts desnecessarios
- Adicionar `forceMount` nos `TabsContent` criticos para evitar perda de estado
- Remover a classe `animate-fade-in` dos `TabsContent` que pode causar problemas visuais ao trocar abas rapidamente

## 2. Destaque do "Painel de Controle Ambiental"

**Estado atual:** Uma linha horizontal simples com um badge `bg-primary/10` pequeno e discreto.

**Redesign proposto:**
- Transformar em um card completo com fundo gradiente sutil (`bg-gradient-to-r from-primary/8 to-accent/5`)
- Icone maior (h-7 w-7) dentro de um circulo com fundo `bg-primary/15`
- Texto maior (`text-lg`) com subtitulo descritivo
- Borda lateral esquerda colorida (`border-l-4 border-primary`) para criar hierarquia visual
- Padding generoso (`p-5`) para dar "respiro"

## 3. Divisoes de Sessoes Mais Modernas

**Problema:** As secoes sao separadas apenas por `space-y-6`, sem divisores visuais claros.

**Redesign:**
- Cada secao de conteudo (Stats, Painel de Controle, Tabs) envolto em um `Card` ou container com borda e padding proprio
- Cards de estatisticas com padding interno aumentado (`p-4` em vez de `p-3`) e icones em circulos coloridos
- Separadores visuais entre secoes usando linhas com gradiente ou espacamento ampliado (`space-y-8`)
- TabsList com estilo mais definido: borda, sombra sutil, padding maior

## 4. Menos "Achatado" - Mais Espacamento

- `space-y-6` no root do SchoolDashboard sobe para `space-y-8`
- Gap dos stat cards de `gap-3 md:gap-4` para `gap-4 md:gap-5`
- Padding interno dos stat cards de `p-3` para `p-4`
- Container principal do Dashboard de `py-5 md:py-8` para `py-6 md:py-10`

---

## Detalhes Tecnicos

### Arquivo: `src/components/SchoolDashboard.tsx`

**Mudancas:**

1. Root `space-y-6` vira `space-y-8`
2. Stats cards: `p-3` vira `p-4`, icones ganham container circular (`w-8 h-8 rounded-full bg-success/15 flex items-center justify-center`)
3. Secao "Painel de Controle Ambiental" redesenhada:

```text
+--------------------------------------------------+
| [icon circle]  PAINEL DE CONTROLE AMBIENTAL      |
|                Monitoramento e registro de dados  |
|                                        [Export]   |
+--------------------------------------------------+
```

Implementado como Card com `border-l-4 border-primary`, fundo `bg-card`, padding `p-5`, icone em circulo, titulo `text-lg font-bold` e subtitulo `text-sm text-muted-foreground`.

4. TabsList com `bg-card border border-border shadow-sm p-1.5 rounded-xl` em vez de `bg-muted/50`
5. Remover `animate-fade-in` de todos `TabsContent` para evitar bugs visuais
6. Adicionar `forceMount` como propriedade nos TabsContent problematicos (calculator e consumption) -- na verdade, melhor simplesmente renderizar condicionalmente para evitar conflitos

### Arquivo: `src/components/Dashboard.tsx`

**Mudancas:**
1. Container padding: `py-5 md:py-8` vira `py-6 md:py-10`
2. Nav tabs: adicionar `border border-border shadow-sm` ao container para dar mais presenca

### Arquivo: `src/index.css`

- Sem mudancas de cores (paleta ja foi ajustada na iteracao anterior)

### Resumo de Impacto

- Bug de navegacao nas abas corrigido removendo animacoes conflitantes
- Secoes visivelmente separadas com cards e bordas
- "Painel de Controle Ambiental" ganha destaque visual significativo
- Espacamento geral aumentado para eliminar o aspecto "apertado"
- Nenhuma mudanca na paleta de cores
