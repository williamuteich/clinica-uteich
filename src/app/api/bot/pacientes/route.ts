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
      let cleanPhone = phone.replace(/\D/g, "");

      if (cleanPhone.startsWith("55") && cleanPhone.length >= 10) {
        cleanPhone = cleanPhone.substring(2);
      }
      const { decrypt } = await import("@/src/lib/encrypted-fields");
      const searchNumber = cleanPhone;

      const allPatients = await prisma.patient.findMany({
        include: {
          appointments: {
            where: { status: "COMPLETED" },
            take: 1
          }
        }
      });

      for (const p of allPatients) {
        try {
          const decryptedPhone = await decrypt(p.phone);
          const dbNumber = decryptedPhone.replace(/\D/g, "");
          
          let cleanDb = dbNumber.startsWith("55") ? dbNumber.substring(2) : dbNumber;
          let cleanSearch = searchNumber.startsWith("55") ? searchNumber.substring(2) : searchNumber;

          // Se a busca tem 10 dígitos, adiciona o "9" no meio para comparar com o banco
          if (cleanSearch.length === 10) {
            cleanSearch = cleanSearch.substring(0, 2) + "9" + cleanSearch.substring(2);
          }

          // Se o banco tem 10 dígitos, adiciona o "9" no meio também
          if (cleanDb.length === 10) {
            cleanDb = cleanDb.substring(0, 2) + "9" + cleanDb.substring(2);
          }

          if (cleanDb === cleanSearch) {
            patient = p;
            break;
          }
        } catch (e: any) {
          console.error(`[BOT] Erro ao descriptografar telefone do paciente ${p.id}:`, e.message);
        }
      }
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
