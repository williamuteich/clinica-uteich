import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const createAppointmentSchema = z
  .object({
    patientId: z.string().min(1).optional().or(z.literal("")),
    guestName: z.string().min(2, "Nome do paciente é obrigatório").optional().or(z.literal("")),
    scheduledAt: z.coerce.date({ message: "Data e hora inválidas" }),
    serviceType: z.string().min(2, "Tipo de serviço é obrigatório"),
    estimatedValue: z.coerce
      .number({ message: "Valor estimado inválido" })
      .min(0, "Valor estimado não pode ser negativo"),
    status: appointmentStatusSchema.default("PENDING").optional(),
  })
  .refine(
    (data) => {
      const hasPatient = data.patientId && data.patientId.trim() !== "";
      const hasGuest = data.guestName && data.guestName.trim() !== "";
      return hasPatient || hasGuest;
    },
    { message: "Informe um paciente cadastrado ou o nome do paciente", path: ["patientId"] }
  );

export const updateAppointmentSchema = z.object({
  scheduledAt: z.coerce.date({ message: "Data e hora inválidas" }).optional(),
  serviceType: z.string().min(2, "Tipo de serviço é obrigatório").optional(),
  estimatedValue: z.coerce
    .number({ message: "Valor estimado inválido" })
    .min(0, "Valor estimado não pode ser negativo")
    .optional(),
  status: appointmentStatusSchema.optional(),
  description: z.string().optional().nullable(),
  guestName: z.string().optional().nullable(),
});

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  patientId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: appointmentStatusSchema.optional(),
});

export type AppointmentStatusInput = z.infer<typeof appointmentStatusSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ListAppointmentsQueryInput = z.infer<typeof listAppointmentsQuerySchema>;
