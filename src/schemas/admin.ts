import { z } from "zod";

export const adminSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  roleId: z.string().min(1, "O cargo é obrigatório"),
  active: z.boolean().default(true).optional()
});

export type AdminInput = z.infer<typeof adminSchema>;
