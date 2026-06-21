import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

function checkBotKey(request: Request): boolean {
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY && !!process.env.BOT_API_KEY;
}

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

function getComparablePhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  const noCountry = clean.startsWith("55") ? clean.slice(2) : clean;
  if (noCountry.length === 11 && noCountry[2] === "9") {
    return noCountry.slice(0, 2) + noCountry.slice(3);
  }
  return noCountry;
}

function comparePhones(phone1: string, phone2: string): boolean {
  const p1 = getComparablePhone(phone1);
  const p2 = getComparablePhone(phone2);
  return !!p1 && p1 === p2;
}

function cleanInputVal(value: any): any {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      return undefined;
    }
    return trimmed;
  }
  return value;
}

function parseLocalTimezone(dateStr: string): string {
  if (typeof dateStr === "string" && !dateStr.endsWith("Z") && !dateStr.includes("+") && !/-\d{2}:\d{2}$/.test(dateStr)) {
    return `${dateStr}-03:00`;
  }
  return dateStr;
}

const createBotAppointmentSchema = z.object({
  nome_paciente: z.string().min(2, "Nome obrigatório"),
  numero_whatsapp: z.string().min(8, "Número obrigatório"),
  data_hora: z.coerce.date({ message: "data_hora inválida — use ISO 8601 (ex: 2025-07-10T14:00:00)" }),
  tipo_consulta: z.string().optional().default("Avaliação"),
  observacoes: z.string().optional().default(""),
});

export async function POST(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  try {
    const body = await request.json();
    body.data_hora = parseLocalTimezone(body.data_hora);

    const parsed = createBotAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nome_paciente, numero_whatsapp, data_hora, tipo_consulta, observacoes } = parsed.data;

    const existing = await prisma.appointment.findFirst({
      where: {
        scheduledAt: data_hora,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
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

export async function GET(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const dataStr = searchParams.get("data");

  if (!dataStr) {
    return NextResponse.json({ error: "Parâmetro 'data' obrigatório (YYYY-MM-DD)" }, { status: 400 });
  }

  const sanitized = dataStr.replace(/['"]/g, "").trim();
  const cleanDataStr = sanitized.substring(0, 10);

  const date = new Date(cleanDataStr);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const start = new Date(`${cleanDataStr}T00:00:00-03:00`);
  const end = new Date(`${cleanDataStr}T23:59:59-03:00`);

  const agendados = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    select: { scheduledAt: true, guestName: true, status: true },
  });

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
    "19:00", "19:15", "19:30", "19:45"
  ];

  const ocupados = agendados.map((a) => {
    const timeStr = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    }).format(a.scheduledAt);
    return timeStr;
  });

  const disponiveis = ALL_SLOTS.filter((s) => !ocupados.includes(s));

  return NextResponse.json({
    data: dataStr,
    horarios_disponiveis: disponiveis,
    horarios_ocupados: ocupados,
    total_disponivel: disponiveis.length,
  });
}

const patchSchema = z.object({
  acao: z.enum(["cancelar", "remarcar"]),
  numero_whatsapp: z.string().min(8, "numero_whatsapp do solicitante é obrigatório"),
  nova_data_hora: z.coerce.date().optional(),
  motivo: z.string().optional(),
});

export async function PATCH(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  try {
    let body: any;
    try {
      body = await request.json();
    } catch (jsonErr) {
      console.error("[PATCH-AGENDA] Falha ao ler JSON:", jsonErr);
      return NextResponse.json({ error: "Corpo da requisição inválido ou vazio" }, { status: 400 });
    }

    body.nova_data_hora = cleanInputVal(body.nova_data_hora);
    body.motivo = cleanInputVal(body.motivo);

    if (body.nova_data_hora) {
      body.nova_data_hora = parseLocalTimezone(body.nova_data_hora);
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("[PATCH-AGENDA] Falha validação Zod:", parsed.error.format());
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { acao, numero_whatsapp, nova_data_hora, motivo } = parsed.data;

    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] }
      },
      orderBy: {
        scheduledAt: "desc"
      }
    });

    const existing = appointments.find(apt =>
      comparePhones(apt.guestPhone ?? "", numero_whatsapp)
    );

    if (!existing) {
      return NextResponse.json({ error: "Nenhum agendamento ativo encontrado para este número." }, { status: 404 });
    }

    const id = existing.id;

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
    console.error("[PATCH-AGENDA] Erro ao processar atualização:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
