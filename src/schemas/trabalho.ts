import { z } from "zod";

export const trabalhoSchema = z.object({
  pacienteId: z.string().optional().nullable(),
  nomePaciente: z.string().min(2, "Nome do paciente é obrigatório"),
  cpfPaciente: z.string().optional().nullable(),
  laboratorio: z.string().min(2, "Nome do laboratório é obrigatório"),
  nomeTrabalho: z.string().min(2, "Nome do trabalho é obrigatório"),
  descricao: z.string().optional().nullable(),
  status: z.enum(["PENDENTE", "CONCLUIDO"]).default("PENDENTE"),
  dataEnvio: z.string().transform((val) => new Date(val)),
  dentesEnvolvidos: z.string().optional().nullable(),
  valor: z.number().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export type TrabalhoInput = z.infer<typeof trabalhoSchema>;
