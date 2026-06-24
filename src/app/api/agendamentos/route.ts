import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { encrypt, decrypt } from "@/src/lib/encrypted-fields";
import { LeadInput } from "@/src/types/dashboard/leads";

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET || "",
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error("Erro ao verificar token do Turnstile:", error);
    return false;
  }
}

async function saveLeadStepOne(input: LeadInput) {
  const encryptedName = await encrypt(input.name);
  const encryptedPhone = await encrypt(input.phone);
  const encryptedServiceType = input.serviceType ? await encrypt(input.serviceType) : null;
  const encryptedObservation = input.observation ? await encrypt(input.observation) : null;

  const data = {
    name: encryptedName,
    phone: encryptedPhone,
    serviceType: encryptedServiceType,
    observation: encryptedObservation,
    gclid: input.gclid || null,
    utmSource: input.utmSource || null,
    utmMedium: input.utmMedium || null,
    utmCampaign: input.utmCampaign || null,
    utmContent: input.utmContent || null,
    utmTerm: input.utmTerm || null,
    conversionUrl: input.conversionUrl || null,
  };

  let targetLeadId = input.leadId;
  if (targetLeadId) {
    try {
      const existing = await prisma.lead.findUnique({
        where: { id: targetLeadId },
        select: { phone: true }
      });
      if (existing) {
        const decryptedPhone = await decrypt(existing.phone);
        if (decryptedPhone.replace(/\D/g, "") !== input.phone.replace(/\D/g, "")) {
          targetLeadId = null;
        }
      } else {
        targetLeadId = null;
      }
    } catch {
      targetLeadId = null;
    }
  }

  if (targetLeadId) {
    return prisma.lead.update({
      where: { id: targetLeadId },
      data,
    });
  }

  return prisma.lead.create({
    data: {
      ...data,
      status: "INTERESTED",
      step: 1,
    },
  });
}

async function findExistingLeadByPhone(cleanPhoneInput: string): Promise<string | null> {
  try {
    const leads = await prisma.lead.findMany({ select: { id: true, phone: true } });
    for (const l of leads) {
      const decryptedPhone = await decrypt(l.phone);
      if (decryptedPhone.replace(/\D/g, "") === cleanPhoneInput) {
        return l.id;
      }
    }
  } catch (err) {
    console.error("Erro ao buscar lead por telefone:", err);
  }
  return null;
}

async function syncLeadStepTwo(appointmentId: string, input: LeadInput) {
  const cleanPhone = input.phone.replace(/\D/g, "");
  let targetLeadId = input.leadId;

  if (targetLeadId) {
    try {
      const existing = await prisma.lead.findUnique({
        where: { id: targetLeadId },
        select: { phone: true }
      });
      if (existing) {
        const decryptedPhone = await decrypt(existing.phone);
        if (decryptedPhone.replace(/\D/g, "") !== cleanPhone) {
          targetLeadId = null;
        }
      } else {
        targetLeadId = null;
      }
    } catch {
      targetLeadId = null;
    }
  }

  if (!targetLeadId) {
    targetLeadId = await findExistingLeadByPhone(cleanPhone);
  }

  if (targetLeadId) {
    return prisma.lead.update({
      where: { id: targetLeadId },
      data: {
        status: "PENDING",
        step: 2,
        appointmentId,
        conversionUrl: input.conversionUrl || undefined,
      },
    });
  }

  const encryptedName = await encrypt(input.name);
  const encryptedPhone = await encrypt(input.phone);
  const encryptedServiceType = input.serviceType ? await encrypt(input.serviceType) : null;
  const encryptedObservation = input.observation ? await encrypt(input.observation) : null;

  return prisma.lead.create({
    data: {
      name: encryptedName,
      phone: encryptedPhone,
      serviceType: encryptedServiceType,
      observation: encryptedObservation,
      status: "PENDING",
      step: 2,
      appointmentId,
      gclid: input.gclid || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      utmContent: input.utmContent || null,
      utmTerm: input.utmTerm || null,
      conversionUrl: input.conversionUrl || null,
    },
  });
}

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
          not: "CANCELLED",
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
    const {
      name,
      phone,
      serviceType,
      observation,
      date,
      time,
      acceptedTerms,
      leadId,
      gclid,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      conversionUrl,
      turnstileToken
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
    }

    let isLeadVerified = false;
    if (leadId) {
      try {
        const existing = await prisma.lead.findUnique({
          where: { id: leadId },
          select: { phone: true }
        });
        if (existing) {
          const decryptedPhone = await decrypt(existing.phone);
          if (decryptedPhone.replace(/\D/g, "") === phone.replace(/\D/g, "")) {
            isLeadVerified = true;
          }
        }
      } catch {
        isLeadVerified = false;
      }
    }

    if (!isLeadVerified) {
      if (!turnstileToken) {
        return NextResponse.json({ error: "Verificação de segurança obrigatória" }, { status: 400 });
      }
      const ip = request.headers.get("x-forwarded-for") || undefined;
      const isValid = await verifyTurnstile(turnstileToken, ip);
      if (!isValid) {
        return NextResponse.json({ error: "Falha na verificação de segurança (Turnstile)" }, { status: 400 });
      }
    }

    const leadInput: LeadInput = {
      name,
      phone,
      serviceType,
      observation,
      leadId,
      gclid,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      conversionUrl
    };

    if (!date || !time) {
      const lead = await saveLeadStepOne(leadInput);
      return NextResponse.json({ success: true, leadId: lead.id });
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
          not: "CANCELLED",
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

    const encryptedServiceType = await encrypt(serviceType || "");
    const encryptedDescription = observation ? (await encrypt(observation)) : null;
    const encryptedGuestName = matchedPatient ? null : (await encrypt(name));
    const encryptedGuestPhone = matchedPatient ? null : (await encrypt(phone));

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: matchedPatient ? matchedPatient.id : null,
        guestName: encryptedGuestName,
        guestPhone: encryptedGuestPhone,
        scheduledAt: proposedDate,
        serviceType: encryptedServiceType,
        estimatedValue: 0,
        description: encryptedDescription,
        status: "PENDING",
        acceptedTerms: !!acceptedTerms,
        termsAcceptedAt: acceptedTerms ? new Date() : null,
        termsVersion: acceptedTerms ? "v1.0-2026-06" : null,
      },
    });

    try {
      await syncLeadStepTwo(newAppointment.id, leadInput);
    } catch (e) {
      console.error("Erro ao sincronizar lead na Etapa 2:", e);
    }

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
