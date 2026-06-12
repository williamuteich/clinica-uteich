import { z } from "zod";

export const toothStatusEnum = z.enum([
    "HEALTHY",
    "CAVITY",
    "ENDODONTICS",
    "PROSTHESIS",
    "IMPLANT",
    "EXTRACTED",
    "RETAINED",
    "OTHER",
]);

const baseEntitySchema = z.object({
    id: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const toothSchema = baseEntitySchema.extend({
    odontogramId: z.string().optional(),
    toothKey: z.string().min(1, "Identificador do dente obrigatório"),
    isCustom: z.boolean().default(false),
    customName: z.string().nullable().optional(),
    status: toothStatusEnum,
    notes: z.string().nullable().optional(),
});

export const odontogramSchema = baseEntitySchema.extend({
    patientId: z.string().optional(),
    teeth: z.array(toothSchema),
});

export type ITooth = z.infer<typeof toothSchema>;
export type IOdontogram = z.infer<typeof odontogramSchema>;
