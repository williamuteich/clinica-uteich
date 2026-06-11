import { z } from "zod";

export const pacienteSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória").refine(d => {
    const date = new Date(d);
    const year = date.getFullYear();
    return !isNaN(date.getTime()) && year >= 1900 && year <= new Date().getFullYear();
  }, "Data de nascimento inválida (deve ser entre 1900 e o ano atual)"),
  phone: z.string().min(10, "Telefone inválido"),
  zipCode: z.string().min(8, "CEP inválido").optional(),
  state: z.string().min(2, "Estado é obrigatório").optional(),
  city: z.string().min(2, "Cidade é obrigatória").optional(),
  street: z.string().min(2, "Rua é obrigatória").optional(),
  number: z.string().min(1, "Número é obrigatório").optional(),
  complement: z.string().optional(),
  active: z.boolean().default(true).optional(),
});

export type PacienteInput = z.infer<typeof pacienteSchema>;

export const pacienteQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  name: z.string().optional(),
  cpf: z.string().optional(),
});

export type PacienteQueryInput = z.infer<typeof pacienteQuerySchema>;

export const evolutionSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  description: z.string().min(3, "Evolução é obrigatória"),
});

export type EvolutionInput = z.infer<typeof evolutionSchema>;
