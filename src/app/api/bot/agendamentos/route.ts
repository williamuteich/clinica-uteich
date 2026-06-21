import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
  checkBotKey,
  unauthorized,
  comparePhones,
  cleanInputVal,
  parseLocalTimezone,
} from "@/src/lib/bot";
import {
  botCreateAppointmentSchema,
  botPatchAppointmentSchema,
} from "@/src/schemas/bot";

export async function POST(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  try {
    const body = await request.json();
    body.data_hora = parseLocalTimezone(body.data_hora);

    const parsed = botCreateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nome_paciente, numero_whatsapp, data_hora, tipo_consulta, observacoes } = parsed.data;

    const conflict = await prisma.appointment.findFirst({
      where: { scheduledAt: data_hora, status: { not: "CANCELLED" } },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Horário indisponível. Já existe uma consulta agendada para este horário." },
        { status: 409 }
      );
    }

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
        tipo_consulta,
        status: created.status,
        message: "Agendamento criado com sucesso",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ─── GET — Horários disponíveis por data ──────────────────────────────────

const ALL_SLOTS = [
  "08:00", "08:15", "08:30", "08:45",
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45",
];

export async function GET(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const dataStr = searchParams.get("data");

  if (!dataStr) {
    return NextResponse.json(
      { error: "Parâmetro 'data' obrigatório (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const cleanDataStr = dataStr.replace(/['"]/g, "").trim().substring(0, 10);
  if (isNaN(new Date(cleanDataStr).getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const start = new Date(`${cleanDataStr}T00:00:00-03:00`);
  const end = new Date(`${cleanDataStr}T23:59:59-03:00`);

  const booked = await prisma.appointment.findMany({
    where: { scheduledAt: { gte: start, lte: end }, status: { not: "CANCELLED" } },
    select: { scheduledAt: true },
  });

  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  const ocupados = booked.map((a) => fmt.format(a.scheduledAt));
  const disponiveis = ALL_SLOTS.filter((s) => !ocupados.includes(s));

  return NextResponse.json({
    data: dataStr,
    horarios_disponiveis: disponiveis,
    horarios_ocupados: ocupados,
    total_disponivel: disponiveis.length,
  });
}

// ─── PATCH — Cancelar ou remarcar ─────────────────────────────────────────

export async function PATCH(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corpo da requisição inválido ou vazio" }, { status: 400 });
    }

    body.nova_data_hora = cleanInputVal(body.nova_data_hora);
    body.motivo = cleanInputVal(body.motivo);

    if (typeof body.nova_data_hora === "string") {
      body.nova_data_hora = parseLocalTimezone(body.nova_data_hora);
    }

    const parsed = botPatchAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { acao, numero_whatsapp, nova_data_hora, motivo } = parsed.data;

    const appointments = await prisma.appointment.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { scheduledAt: "desc" },
    });

    const existing = appointments.find((apt) =>
      comparePhones(apt.guestPhone ?? "", numero_whatsapp)
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Nenhum agendamento ativo encontrado para este número." },
        { status: 404 }
      );
    }

    const { id } = existing;

    if (acao === "cancelar") {
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          description: motivo ? `Cancelado via WhatsApp: ${motivo}` : "Cancelado via WhatsApp",
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
          description: motivo ? `Remarcado via WhatsApp: ${motivo}` : "Remarcado via WhatsApp",
        },
      });
      return NextResponse.json({
        id,
        data_hora: updated.scheduledAt.toISOString(),
        status: updated.status,
        message: "Agendamento remarcado com sucesso",
      });
    }
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
