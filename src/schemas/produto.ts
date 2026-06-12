import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    quantity: z.number().int().min(0, "Quantidade não pode ser negativa"),
    minimumQuantity: z.number().int().min(0),
    expirationDate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export const stockAdjustmentSchema = z.object({
    delta: z.number().int(),
    notes: z.string().nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
