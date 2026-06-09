import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { encrypt, decrypt } from "@/src/lib/encrypted-fields";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Formato de data inválido. Use YYYY-MM-DD" }, { status: 400 });
    }

    const startDate = new Date(`${date}T00:00:00-03:00`);
    const endDate = new Date(`${date}T23:59:59-03:00`);

    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "CANCELADO",
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    return NextResponse.json({
      appointments: appointments.map((apt) => ({
        scheduledAt: apt.scheduledAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Erro ao listar agendamentos públicos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, serviceType, observation, date, time } = body;

    if (!name || !phone || !serviceType || !date || !time) {
      return NextResponse.json({ error: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Formato de data inválido. Use YYYY-MM-DD" }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: "Formato de hora inválido. Use HH:MM" }, { status: 400 });
    }

    const proposedDate = new Date(`${date}T${time}:00-03:00`);
    if (isNaN(proposedDate.getTime())) {
      return NextResponse.json({ error: "Data ou hora inválida" }, { status: 400 });
    }

    if (proposedDate.getTime() < Date.now()) {
      return NextResponse.json({ error: "Não é possível agendar uma consulta no passado" }, { status: 400 });
    }

    const dayOfWeek = proposedDate.getDay();
    if (dayOfWeek === 0) {
      return NextResponse.json({ error: "A clínica não abre aos domingos" }, { status: 400 });
    }

    const [hours, minutes] = time.split(":").map(Number);
    const timeMinutes = hours * 60 + minutes;
    const minTime = 10 * 60;
    const maxTime = 19 * 60 + 30;

    if (timeMinutes < minTime || timeMinutes > maxTime) {
      return NextResponse.json({ error: "Horário de atendimento é das 10:00 às 19:30" }, { status: 400 });
    }

    const startDate = new Date(`${date}T00:00:00-03:00`);
    const endDate = new Date(`${date}T23:59:59-03:00`);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "CANCELADO",
        },
      },
    });

    const proposedMs = proposedDate.getTime();
    for (const apt of existingAppointments) {
      const diffMinutes = Math.abs(apt.scheduledAt.getTime() - proposedMs) / (1000 * 60);
      if (diffMinutes < 15) {
        return NextResponse.json({
          error: "Conflito de horário. O intervalo mínimo entre consultas é de 15 minutos. Escolha outro horário.",
        }, { status: 400 });
      }
    }

    const cleanPhoneInput = phone.replace(/\D/g, "");
    if (cleanPhoneInput.length < 10) {
      return NextResponse.json({ error: "Número de telefone inválido" }, { status: 400 });
    }

    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
      },
    });

    let matchedPatient = null;
    for (const p of patients) {
      try {
        const decryptedPhone = await decrypt(p.phone);
        const cleanDbPhone = decryptedPhone.replace(/\D/g, "");
        if (cleanDbPhone === cleanPhoneInput ||
          (cleanDbPhone.length >= 8 && cleanPhoneInput.endsWith(cleanDbPhone.slice(-8))) ||
          (cleanPhoneInput.length >= 8 && cleanDbPhone.endsWith(cleanPhoneInput.slice(-8)))) {
          matchedPatient = p;
          break;
        }
      } catch (e) {
        console.error("Erro ao descriptografar telefone do paciente", p.id, e);
      }
    }

    const description = `Agendado pelo site.\nTelefone/WhatsApp: ${phone}\nStatus cadastro: ${matchedPatient ? "Paciente já cadastrado" : "Cliente sem cadastro no sistema"}${observation ? `\nObservação: ${observation}` : ""}`;

    const encryptedServiceType = await encrypt(serviceType);

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: matchedPatient ? matchedPatient.id : null,
        guestName: matchedPatient ? null : name,
        scheduledAt: proposedDate,
        serviceType: encryptedServiceType,
        estimatedValue: 0,
        description,
        status: "PENDENTE",
      },
    });

    return NextResponse.json({
      success: true,
      appointmentId: newAppointment.id,
      patientMatched: !!matchedPatient,
      patientName: matchedPatient ? matchedPatient.name : name,
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar agendamento público:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
