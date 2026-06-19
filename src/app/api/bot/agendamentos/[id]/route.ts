/**
 * /api/bot/agendamentos/[id]
 * PATCH — remarcar ou cancelar um agendamento existente
 * GET   — buscar agendamento por ID
 *
 * SEGURANÇA:
 * - Autenticado por x-bot-api-key (só o n8n conhece)
 * - PATCH exige numero_whatsapp no body que deve coincidir com o dono do agendamento
 *   → evita que um paciente cancele/remarque o agendamento de outro
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

function checkBotKey(request: Request): boolean {
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY && !!process.env.BOT_API_KEY;
}

/** Normaliza número: mantém só dígitos */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

const patchSchema = z.object({
  acao: z.enum(["cancelar", "remarcar"]),
  numero_whatsapp: z.string().min(8, "numero_whatsapp do solicitante é obrigatório"),
  nova_data_hora: z.coerce.date().optional(),
  motivo: z.string().optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  if (!checkBotKey(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { acao, numero_whatsapp, nova_data_hora, motivo } = parsed.data;

    const existing = await prisma.appointment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    // ✅ VERIFICAÇÃO DE PROPRIEDADE
    // Compara o número de quem está pedindo com o dono do agendamento
    const ownerPhone = normalizePhone(existing.guestPhone ?? "");
    const requesterPhone = normalizePhone(numero_whatsapp);

    if (!ownerPhone || ownerPhone !== requesterPhone) {
      // Retorna 404 propositalmente — não revelamos que o agendamento existe
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    if (acao === "cancelar") {
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          description: motivo
            ? `Cancelado via WhatsApp: ${motivo}`
            : "Cancelado via WhatsApp",
        },
      });

      return NextResponse.json({
        id,
        status: updated.status,
        message: "Agendamento cancelado com sucesso",
      });
    }

    if (acao === "remarcar") {
      if (!nova_data_hora) {
        return NextResponse.json(
          { error: "nova_data_hora é obrigatória para remarcar" },
          { status: 400 }
        );
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          scheduledAt: nova_data_hora,
          status: "PENDING",
          description: motivo
            ? `Remarcado via WhatsApp: ${motivo}`
            : "Remarcado via WhatsApp",
        },
      });

      return NextResponse.json({
        id,
        data_hora: updated.scheduledAt.toISOString(),
        status: updated.status,
        message: "Agendamento remarcado com sucesso",
      });
    }
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }
    console.error("[BOT] Erro ao atualizar agendamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(request: Request, ctx: Ctx) {
  if (!checkBotKey(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const numero = searchParams.get("numero_whatsapp");

  const apt = await prisma.appointment.findUnique({ where: { id } });

  if (!apt) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  // Se número foi passado, verifica propriedade
  if (numero) {
    const ownerPhone = normalizePhone(apt.guestPhone ?? "");
    const requesterPhone = normalizePhone(numero);
    if (ownerPhone !== requesterPhone) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }
  }

  return NextResponse.json({
    id: apt.id,
    data_hora: apt.scheduledAt.toISOString(),
    tipo_consulta: apt.serviceType,
    status: apt.status,
    nome_paciente: apt.guestName,
    numero_whatsapp: apt.guestPhone,
  });
}
