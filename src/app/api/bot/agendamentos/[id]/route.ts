import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { encrypt } from "@/src/lib/encrypted-fields";
import {
  checkBotKey,
  unauthorized,
  cleanInputVal,
  parseLocalTimezone,
  verifyAppointmentOwnership,
  formatAppointmentForBot,
} from "@/src/lib/bot";
import { botPatchAppointmentSchema } from "@/src/schemas/bot";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!checkBotKey(request)) return unauthorized();

  const { id } = await ctx.params;

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

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    const isOwner = await verifyAppointmentOwnership(existing, numero_whatsapp);
    if (!isOwner) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    if (acao === "cancelar") {
      const encDesc = motivo ? await encrypt(`Cancelado via WhatsApp: ${motivo}`) : await encrypt("Cancelado via WhatsApp");

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          description: encDesc,
        },
      });

      try {
        await prisma.lead.updateMany({
          where: { appointmentId: id },
          data: { status: "CANCELLED" },
        });
      } catch (e) {
        console.error("Erro ao atualizar status do lead no bot:", e);
      }

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

      const encDesc = motivo ? await encrypt(`Remarcado via WhatsApp: ${motivo}`) : await encrypt("Remarcado via WhatsApp");

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          scheduledAt: nova_data_hora,
          status: "PENDING",
          description: encDesc,
        },
      });

      try {
        await prisma.lead.updateMany({
          where: { appointmentId: id },
          data: { status: "PENDING" },
        });
      } catch (e) {
        console.error("Erro ao atualizar status do lead no bot:", e);
      }

      return NextResponse.json({
        id,
        data_hora: updated.scheduledAt.toISOString(),
        status: updated.status,
        message: "Agendamento remarcado com sucesso",
      });
    }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }
    console.error("[PATCH-AGENDAMENTO-ID] Erro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(request: Request, ctx: Ctx) {
  if (!checkBotKey(request)) return unauthorized();

  const { id } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const numero = searchParams.get("numero_whatsapp");

  if (!numero) {
    return NextResponse.json(
      { error: "Parâmetro 'numero_whatsapp' obrigatório" },
      { status: 400 }
    );
  }

  const apt = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
        }
      }
    }
  });

  if (!apt) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const isOwner = await verifyAppointmentOwnership(apt, numero);
  if (!isOwner) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const formatted = await formatAppointmentForBot(apt);

  return NextResponse.json(formatted);
}
