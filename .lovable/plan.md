
# Reduzir o Efeito Neon - Visual Mais Sério e Institucional

## Problema Identificado
As cores atuais usam **saturação muito alta** (100% no azul primário, 100% no accent cyan) e as **sombras com glow colorido** reforçam o aspecto neon. Isso transmite uma estética tecnológica/gamer em vez de institucional.

## Estratégia
Manter os mesmos matizes (azul, verde, roxo) mas **reduzir a saturação em ~20-30%** e **ajustar a luminosidade** para tons mais sóbrios. Trocar sombras com glow colorido por sombras neutras e suaves.

---

## Mudanças no arquivo `src/index.css`

### Modo Escuro (`:root`)

| Token | Atual | Novo | Motivo |
|-------|-------|------|--------|
| `--primary` | `210 100% 55%` | `210 70% 50%` | Azul menos elétrico |
| `--primary-glow` | `210 100% 65%` | `210 60% 58%` | Reduzir brilho |
| `--primary-vibrant` | `210 100% 60%` | `210 65% 55%` | Menos vibrante |
| `--accent` | `195 100% 50%` | `195 65% 45%` | Cyan menos neon |
| `--blue` | `210 100% 55%` | `210 70% 50%` | Consistente com primary |
| `--blue-light` | `210 100% 65%` | `210 60% 58%` | Mais suave |
| `--green` | `142 70% 50%` | `142 55% 45%` | Verde mais natural |
| `--purple` | `265 70% 60%` | `265 50% 52%` | Roxo mais discreto |
| `--purple-vibrant` | `265 80% 70%` | `265 55% 58%` | Menos chamativo |
| `--destructive` | `0 85% 60%` | `0 65% 52%` | Vermelho menos gritante |
| `--foreground` | `210 100% 95%` | `210 20% 95%` | Texto branco menos azulado |
| `--ring` | `210 100% 55%` | `210 70% 50%` | Consistente |

### Sombras - Trocar glow colorido por sombras neutras

| Token | Atual | Novo |
|-------|-------|------|
| `--shadow-eco` | glow azul 0.3 | `0 4px 20px -4px hsl(220 20% 4% / 0.3)` |
| `--shadow-soft` | glow azul 0.15 | `0 2px 10px -2px hsl(220 15% 4% / 0.15)` |
| `--shadow-glow` | glow azul forte 0.4 | `0 0 30px hsl(210 50% 50% / 0.15)` |
| `--shadow-accent` | glow cyan 0.3 | `0 0 20px hsl(195 40% 45% / 0.12)` |
| `--shadow-purple` | glow roxo 0.3 | `0 0 20px hsl(265 35% 50% / 0.12)` |

### Gradientes - Usar as novas cores (saturacao reduzida)
Atualizar todos os gradientes para usar os novos valores com saturacao menor.

### Modo Claro (`.light`)
Mesma logica: reduzir saturacao do `--primary` de 100% para 70%, `--accent` de 100% para 65%, etc.

---

## Mudancas no arquivo `src/components/ui/button.tsx`

- Remover `shadow-glow` dos hovers (efeito neon forte)
- Substituir por `shadow-lg` ou `shadow-xl` (sombras neutras do Tailwind)
- Reduzir `hover:scale-[1.05]` do variant `vibrant` para `hover:scale-[1.02]`
- Remover o variant `vibrant` com gradiente ou tornar suas cores mais sóbrias

---

## Resumo do Impacto

- Mesma paleta de cores (azul, verde, roxo), apenas mais sóbria
- Sombras neutras em vez de glow colorido
- Botoes com hover mais discreto
- Visual institucional mantendo a identidade do app
- Funciona tanto no modo claro quanto no escuro
