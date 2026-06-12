import { z } from "zod";

export const taskSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;

export const taskQuerySchema = z.object({
  completed: z.enum(["true", "false"]).optional(),
});

export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
