import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

function checkBotKey(request: Request): boolean {
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY && !!process.env.BOT_API_KEY;
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
    let body: any;
    try {
      body = await request.json();
    } catch (jsonErr) {
      console.error("[PATCH-ID] Falha ao ler JSON:", jsonErr);
      return NextResponse.json({ error: "Corpo da requisição inválido ou vazio" }, { status: 400 });
    }

    body.nova_data_hora = cleanInputVal(body.nova_data_hora);
    body.motivo = cleanInputVal(body.motivo);

    if (body.nova_data_hora) {
      body.nova_data_hora = parseLocalTimezone(body.nova_data_hora);
    }


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

    if (!comparePhones(existing.guestPhone ?? "", numero_whatsapp)) {
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

  if (numero && !comparePhones(apt.guestPhone ?? "", numero)) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
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
