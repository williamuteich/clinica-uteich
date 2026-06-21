import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkBotKey, unauthorized, getComparablePhone, startOfTodayLocal } from "@/src/lib/bot";
import { botMyAppointmentsQuerySchema } from "@/src/schemas/bot";

export async function GET(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  const { searchParams } = new URL(request.url);

  const parsed = botMyAppointmentsQuerySchema.safeParse({
    numero_whatsapp: searchParams.get("numero_whatsapp"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { numero_whatsapp } = parsed.data;

  const comparablePhone = getComparablePhone(numero_whatsapp);

  const agendamentos = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: startOfTodayLocal() },
      status: { not: "CANCELLED" },
      guestPhone: { contains: comparablePhone },
    },
    orderBy: { scheduledAt: "asc" },
    take: 20,
    select: {
      id: true,
      scheduledAt: true,
      serviceType: true,
      status: true,
      guestName: true,
    },
  });

  return NextResponse.json({
    agendamentos: agendamentos.map((apt) => ({
      id: apt.id,
      data_hora: apt.scheduledAt.toISOString(),
      tipo_consulta: apt.serviceType,
      status: apt.status,
      nome_paciente: apt.guestName,
    })),
  });
}
