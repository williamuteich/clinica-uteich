import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { withAudit } from "@/src/lib/audit";
import {
  createAppointmentSchema,
  listAppointmentsQuerySchema,
} from "@/src/schemas/agendamento";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { Appointment, AgendamentosResponse } from "@/src/types/dashboard/pacientes";
import { decrypt, encrypt } from "@/src/lib/encrypted-fields";

const ENCRYPTED_FIELDS = [
  { name: "serviceType", action: encrypt, shouldProcess: (val: string) => !val.includes(":") && val.trim() !== "" },
] as const;

const DECRYPT_FIELDS = [
  { name: "serviceType", action: decrypt, shouldProcess: (val: string) => val.includes(":") && val.trim() !== "" },
] as const;

async function processData(data: any, fields: typeof ENCRYPTED_FIELDS | typeof DECRYPT_FIELDS): Promise<any> {
  if (!data) return data;

  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => processData(item, fields)));
  }

  const res = { ...data };
  for (const field of fields) {
    const val = res[field.name];
    if (typeof val === "string" && val.trim() !== "" && field.shouldProcess(val)) {
      try {
        res[field.name] = await field.action(val);
      } catch (error) {
        console.error("Erro ao processar campo", field.name, error);
        throw error;
      }
    }
  }

  return res;
}

const encryptData = (data: any) => processData(data, ENCRYPTED_FIELDS);
const decryptData = (data: any) => processData(data, DECRYPT_FIELDS);

async function getAppointmentsFromDb(where: any, page: number, limit: number) {
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

function mapAppointment(appointment: any): Appointment {
  return {
    id: appointment.id,
    patientId: appointment.patientId || null,
    patientName: appointment.patient?.name || appointment.guestName || "Paciente",
    guestName: appointment.guestName || null,
    scheduledAt: appointment.scheduledAt?.toISOString?.() || String(appointment.scheduledAt),
    serviceType: appointment.serviceType,
    estimatedValue: appointment.estimatedValue,
    status: appointment.status,
    description: appointment.description || null,
    createdAt: appointment.createdAt?.toISOString?.() || String(appointment.createdAt),
    updatedAt: appointment.updatedAt?.toISOString?.() || String(appointment.updatedAt),
  };
}

export async function GET(request: Request) {
  const session = await checkAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!hasPermission(session, "agenda", "visualizar")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const validated = listAppointmentsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!validated.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { page, limit, patientId, startDate, endDate, status } = validated.data;

  const where: any = {
    ...(patientId ? { patientId } : {}),
    ...(status ? { status } : {}),
    ...((startDate || endDate)
      ? {
          scheduledAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const { appointments, total } = await getAppointmentsFromDb(where, page, limit);
  const decryptedAppointments = await decryptData(appointments);

  const payload: AgendamentosResponse = {
    agendamentos: decryptedAppointments.map(mapAppointment),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };

  return NextResponse.json(payload);
}

async function _POST(request: Request) {
  const session = await checkAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!hasPermission(session, "agenda", "criar")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = createAppointmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const encryptedBody = await encryptData(validated.data);

    const isGuest = !encryptedBody.patientId || encryptedBody.patientId.trim() === "";

    const created = await prisma.appointment.create({
      data: {
        ...(isGuest
          ? { guestName: encryptedBody.guestName }
          : { patientId: encryptedBody.patientId }),
        scheduledAt: encryptedBody.scheduledAt,
        serviceType: encryptedBody.serviceType,
        estimatedValue: encryptedBody.estimatedValue,
        status: encryptedBody.status || "PENDING",
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidateTag("agenda-list", "max");
    return NextResponse.json(mapAppointment(await decryptData(created)), { status: 201 });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Paciente inválido para agendamento" },
        { status: 400 }
      );
    }

    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export const POST = withAudit(_POST, {
  resource: "agenda",
  getResourceName: (data: any) => data.serviceType,
});
