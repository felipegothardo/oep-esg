import { z } from 'zod';

// Validation schemas for all data types
export const recyclingEntrySchema = z.object({
  material: z.string()
    .trim()
    .min(1, "Material é obrigatório")
    .max(100, "Material deve ter no máximo 100 caracteres"),
  quantity: z.number()
    .positive("Quantidade deve ser maior que zero")
    .max(100000, "Quantidade muito alta - verifique o valor"),
  co2Saved: z.number()
    .nonnegative("CO2 economizado não pode ser negativo")
    .max(1000000, "Valor de CO2 muito alto"),
  date: z.string()
    .min(1, "Data é obrigatória")
});

export const consumptionEntrySchema = z.object({
  type: z.enum(['water', 'energy'], {
    errorMap: () => ({ message: "Tipo deve ser 'water' ou 'energy'" })
  }),
  month: z.string()
    .trim()
    .min(1, "Mês é obrigatório")
    .max(20, "Formato de mês inválido")
    .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Formato deve ser MM/YYYY"),
  cost: z.number()
    .nonnegative("Custo não pode ser negativo")
    .max(1000000, "Valor muito alto - verifique o custo"),
  consumption: z.number()
    .positive("Consumo deve ser maior que zero")
    .max(10000000, "Valor de consumo muito alto"),
  date: z.string()
    .min(1, "Data é obrigatória")
});

export const consumptionGoalSchema = z.object({
  type: z.enum(['water', 'energy'], {
    errorMap: () => ({ message: "Tipo deve ser 'water' ou 'energy'" })
  }),
  reductionPercentage: z.number()
    .min(0, "Porcentagem não pode ser negativa")
    .max(100, "Porcentagem não pode ser maior que 100")
});

// Custom material validation
export const customMaterialSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Nome do material é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  co2Factor: z.number()
    .positive("Fator de CO2 deve ser maior que zero")
    .max(100, "Fator de CO2 muito alto - verifique o valor")
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, "Mensagem não pode estar vazia")
    .max(1000, "Mensagem muito longa (máximo 1000 caracteres)"),
  user_name: z.string()
    .trim()
    .min(1, "Nome do usuário é obrigatório")
    .max(100, "Nome muito longo")
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  try {
    const validated = schema.parse(data);
    return { success: true as const, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false as const, error: firstError.message };
    }
    return { success: false as const, error: "Erro de validação desconhecido" };
  }
}

// Sanitize string inputs
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Hard limit
}

// Sanitize number inputs
export function sanitizeNumber(input: number, max: number = 1000000): number {
  if (isNaN(input) || !isFinite(input)) return 0;
  return Math.min(Math.max(0, input), max);
}
