import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { decrypt, isEncrypted } from "./encrypted-fields";

export function checkBotKey(request: Request): boolean {
  if (!process.env.BOT_API_KEY) return false;
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY;
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export function getComparablePhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  const noCountry = clean.startsWith("55") ? clean.slice(2) : clean;
  if (noCountry.length === 11 && noCountry[2] === "9") {
    return noCountry.slice(0, 2) + noCountry.slice(3);
  }
  return noCountry;
}

export function comparePhones(phone1: string, phone2: string): boolean {
  const p1 = getComparablePhone(phone1);
  const p2 = getComparablePhone(phone2);
  return !!p1 && p1 === p2;
}

export function parseLocalTimezone(dateStr: string): string {
  if (
    typeof dateStr === "string" &&
    !dateStr.endsWith("Z") &&
    !dateStr.includes("+") &&
    !/-\d{2}:\d{2}$/.test(dateStr)
  ) {
    return `${dateStr}-03:00`;
  }
  return dateStr;
}

export function startOfTodayLocal(): Date {
  const now = new Date();
  const localISO = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10);
  return new Date(`${localISO}T00:00:00-03:00`);
}

export function cleanInputVal(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      return undefined;
    }
    return trimmed;
  }
  return value;
}

export async function findActiveAppointmentsForPhone(phone: string) {
  const startOfToday = startOfTodayLocal();

  const allPatients = await prisma.patient.findMany({
    select: { id: true, phone: true }
  });

  const matchingPatientIds: string[] = [];
  for (const p of allPatients) {
    try {
      const decryptedPhone = isEncrypted(p.phone) ? await decrypt(p.phone) : p.phone;
      if (comparePhones(decryptedPhone, phone)) {
        matchingPatientIds.push(p.id);
      }
    } catch (error) {
      console.error(`[findActiveAppointmentsForPhone] Erro ao descriptografar telefone do paciente ${p.id}:`, error);
    }
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: startOfToday },
      status: { not: "CANCELLED" }
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
        }
      }
    },
    orderBy: { scheduledAt: "asc" }
  });

  const matched = [];
  for (const apt of appointments) {
    let isMatch = false;

    if (apt.patientId && matchingPatientIds.includes(apt.patientId)) {
      isMatch = true;
    } else if (apt.guestPhone) {
      try {
        const decryptedGuestPhone = isEncrypted(apt.guestPhone)
          ? await decrypt(apt.guestPhone)
          : apt.guestPhone;
        if (comparePhones(decryptedGuestPhone, phone)) {
          isMatch = true;
        }
      } catch (error) {
        console.error(`[findActiveAppointmentsForPhone] Erro ao descriptografar guestPhone do agendamento ${apt.id}:`, error);
      }
    }

    if (isMatch) {
      matched.push(apt);
    }
  }

  return matched;
}

export async function formatAppointmentForBot(apt: any) {
  let tipoConsulta = "Consulta";
  if (apt.serviceType) {
    try {
      tipoConsulta = isEncrypted(apt.serviceType) ? await decrypt(apt.serviceType) : apt.serviceType;
    } catch (error) {
      console.error(`[formatAppointmentForBot] Erro ao descriptografar serviceType do agendamento ${apt.id}:`, error);
    }
  }

  let nomePaciente = apt.patient?.name || "";
  if (!nomePaciente && apt.guestName) {
    try {
      nomePaciente = isEncrypted(apt.guestName) ? await decrypt(apt.guestName) : apt.guestName;
    } catch (error) {
      console.error(`[formatAppointmentForBot] Erro ao descriptografar guestName do agendamento ${apt.id}:`, error);
    }
  }

  return {
    id: apt.id,
    data_hora: apt.scheduledAt.toISOString(),
    tipo_consulta: tipoConsulta,
    status: apt.status,
    nome_paciente: nomePaciente || "Paciente",
  };
}

export async function verifyAppointmentOwnership(apt: any, phone: string): Promise<boolean> {
  if (apt.guestPhone) {
    try {
      const decrypted = isEncrypted(apt.guestPhone) ? await decrypt(apt.guestPhone) : apt.guestPhone;
      if (comparePhones(decrypted, phone)) return true;
    } catch (error) {
      console.error(`[verifyAppointmentOwnership] Erro ao descriptografar guestPhone do agendamento ${apt.id}:`, error);
    }
  }

  if (apt.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: apt.patientId },
      select: { phone: true }
    });
    if (patient) {
      try {
        const decrypted = isEncrypted(patient.phone) ? await decrypt(patient.phone) : patient.phone;
        if (comparePhones(decrypted, phone)) return true;
      } catch (error) {
        console.error(`[verifyAppointmentOwnership] Erro ao descriptografar phone do paciente ${patient.id}:`, error);
      }
    }
  }

  return false;
}
