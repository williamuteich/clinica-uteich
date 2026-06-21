import { NextResponse } from "next/server";
import {
  checkBotKey,
  unauthorized,
  findActiveAppointmentsForPhone,
  formatAppointmentForBot,
} from "@/src/lib/bot";
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

  try {
    const matched = await findActiveAppointmentsForPhone(numero_whatsapp);

    const formatted = await Promise.all(
      matched.map((apt) => formatAppointmentForBot(apt))
    );

    return NextResponse.json({
      agendamentos: formatted,
    });
  } catch (error) {
    console.error("[GET-MEUS-AGENDAMENTOS] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
