import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function checkBotKey(request: Request): boolean {
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY && !!process.env.BOT_API_KEY;
}

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!checkBotKey(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const cpf = searchParams.get("cpf");

  if (!phone && !cpf) {
    return NextResponse.json(
      { error: "Informe o parâmetro 'phone' (telefone) ou 'cpf' para busca." },
      { status: 400 }
    );
  }

  try {
    let patient = null;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");

      patient = await prisma.patient.findFirst({
        where: {
          OR: [
            { phone: phone },
            { phone: { contains: cleanPhone } }
          ]
        },
        include: {
          appointments: {
            where: { status: "COMPLETED" },
            take: 1
          }
        }
      });
    }

    if (!patient && cpf) {
      const cleanCpf = cpf.replace(/\D/g, "");
      patient = await prisma.patient.findFirst({
        where: {
          OR: [
            { cpf: cpf },
            { cpf: { contains: cleanCpf } }
          ]
        },
        include: {
          appointments: {
            where: { status: "COMPLETED" },
            take: 1
          }
        }
      });
    }

    if (!patient) {
      return NextResponse.json({
        cadastrado: false,
        ja_consultou: false,
        message: "Paciente não encontrado."
      });
    }

    const jaConsultou = patient.appointments.length > 0;

    return NextResponse.json({
      cadastrado: true,
      ja_consultou: jaConsultou,
      paciente: {
        id: patient.id,
        nome: patient.name,
        telefone: patient.phone,
        cpf: patient.cpf,
      },
      message: jaConsultou
        ? "Paciente cadastrado e já realizou consultas anteriormente."
        : "Paciente cadastrado, mas ainda não realizou nenhuma consulta na clínica."
    });

  } catch (error: any) {
    console.error("[BOT] Erro ao buscar paciente:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar paciente" },
      { status: 500 }
    );
  }
}
