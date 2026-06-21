import { z } from "zod";

export const botCreateAppointmentSchema = z.object({
  nome_paciente: z.string().min(2, "Nome obrigatório"),
  numero_whatsapp: z.string().min(8, "Número obrigatório"),
  data_hora: z.coerce.date({
    message: "data_hora inválida — use ISO 8601 (ex: 2025-07-10T14:00:00)",
  }),
  tipo_consulta: z.string().optional().default("Avaliação"),
  observacoes: z.string().optional().default(""),
});

export type BotCreateAppointmentInput = z.infer<typeof botCreateAppointmentSchema>;

export const botPatchAppointmentSchema = z.object({
  acao: z.enum(["cancelar", "remarcar"]),
  numero_whatsapp: z.string().min(8, "numero_whatsapp é obrigatório"),
  nova_data_hora: z.coerce.date().optional(),
  motivo: z.string().optional(),
});

export type BotPatchAppointmentInput = z.infer<typeof botPatchAppointmentSchema>;

export const botMyAppointmentsQuerySchema = z.object({
  numero_whatsapp: z.string().min(8, "numero_whatsapp é obrigatório"),
});

export type BotMyAppointmentsQueryInput = z.infer<typeof botMyAppointmentsQuerySchema>;
