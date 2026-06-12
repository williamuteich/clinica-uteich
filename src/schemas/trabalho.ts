import { z } from "zod";

export const protheticWorkSchema = z.object({
  patientId: z.string().optional().nullable(),
  patientName: z.string().min(2, "Nome do paciente é obrigatório"),
  patientCpf: z.string().optional().nullable(),
  laboratory: z.string().min(2, "Nome do laboratório é obrigatório"),
  workName: z.string().min(2, "Nome do trabalho é obrigatório"),
  description: z.string().optional().nullable(),
  status: z.enum(["PENDING", "DONE"]).default("PENDING"),
  sentAt: z.string().transform((val) => new Date(val)),
  teethInvolved: z.string().optional().nullable(),
  value: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ProtheticWorkInput = z.infer<typeof protheticWorkSchema>;
