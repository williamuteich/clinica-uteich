/**
 * /api/bot/agendamentos
 * Rota dedicada para o assistente virtual (n8n + WhatsApp).
 * Autenticada via API Key (header x-bot-api-key), sem necessidade de sessão NextAuth.
 *
 * POST  — cria agendamento (guest, pelo WhatsApp)
 * GET   — lista agendamentos / horários disponíveis
 */

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function checkBotKey(request: Request): boolean {
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY && !!process.env.BOT_API_KEY;
}

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createBotAppointmentSchema = z.object({
  nome_paciente: z.string().min(2, "Nome obrigatório"),
  numero_whatsapp: z.string().min(8, "Número obrigatório"),
  data_hora: z.coerce.date({ message: "data_hora inválida — use ISO 8601 (ex: 2025-07-10T14:00:00)" }),
  tipo_consulta: z.string().optional().default("Avaliação"),
  observacoes: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// POST — criar agendamento
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  try {
    const body = await request.json();
    const parsed = createBotAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nome_paciente, numero_whatsapp, data_hora, tipo_consulta, observacoes } = parsed.data;

    const created = await prisma.appointment.create({
      data: {
        guestName: nome_paciente,
        guestPhone: numero_whatsapp,
        scheduledAt: data_hora,
        serviceType: tipo_consulta,
        estimatedValue: 0,
        status: "PENDING",
        description: observacoes || null,
        billingType: "Particular",
      },
    });


    return NextResponse.json(
      {
        id: created.id,
        nome_paciente,
        numero_whatsapp,
        data_hora: created.scheduledAt.toISOString(),
        tipo_consulta: tipo_consulta,
        status: created.status,
        message: "Agendamento criado com sucesso",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[BOT] Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET — horários disponíveis em uma data
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const dataStr = searchParams.get("data"); // ex: 2025-07-10

  if (!dataStr) {
    return NextResponse.json({ error: "Parâmetro 'data' obrigatório (YYYY-MM-DD)" }, { status: 400 });
  }

  const date = new Date(dataStr);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const agendados = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    select: { scheduledAt: true },
  });

  // Slots padrão da clínica
  const ALL_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  const ocupados = agendados.map((a) => {
    const h = a.scheduledAt.getHours().toString().padStart(2, "0");
    const m = a.scheduledAt.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  });

  const disponiveis = ALL_SLOTS.filter((s) => !ocupados.includes(s));

  return NextResponse.json({
    data: dataStr,
    horarios_disponiveis: disponiveis,
    horarios_ocupados: ocupados,
    total_disponivel: disponiveis.length,
  });
}
