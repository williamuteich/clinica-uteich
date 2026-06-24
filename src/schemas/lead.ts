import { z } from "zod";

export const leadStatusSchema = z.enum([
  "INTERESTED",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const createLeadSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  serviceType: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  utmTerm: z.string().optional().nullable(),
});

export const updateLeadSchema = z.object({
  status: leadStatusSchema.optional(),
  step: z.number().int().optional(),
  appointmentId: z.string().optional().nullable(),
});

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQueryInput = z.infer<typeof listLeadsQuerySchema>;
