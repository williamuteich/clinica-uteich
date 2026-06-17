import { z } from "zod";

export const treatmentSchema = z.object({
    name: z.string().min(3, "Nome do tratamento deve ter no mínimo 3 caracteres"),
    category: z.string().min(2, "Categoria é obrigatória"),
    valuePrivate: z.number().min(0, "Valor particular deve ser maior ou igual a zero"),
    valuePlan: z.number().min(0, "Valor do plano deve ser maior ou igual a zero"),
    active: z.boolean().default(true).optional(),
});

export type TreatmentInput = z.infer<typeof treatmentSchema>;

export const updateTreatmentSchema = treatmentSchema.partial();

export type UpdateTreatmentInputSchema = z.infer<typeof updateTreatmentSchema>;
