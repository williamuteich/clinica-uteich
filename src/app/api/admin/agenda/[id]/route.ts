import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { withAudit } from "@/src/lib/audit";
import { updateAppointmentSchema } from "@/src/schemas/agendamento";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { Appointment } from "@/src/types/dashboard/pacientes";
import { decrypt, encrypt } from "@/src/lib/encrypted-fields";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

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

async function getAppointmentFromDb(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

function mapAppointment(appointment: any): Appointment {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patient?.name || "Paciente",
    scheduledAt: appointment.scheduledAt?.toISOString?.() || String(appointment.scheduledAt),
    serviceType: appointment.serviceType,
    estimatedValue: appointment.estimatedValue,
    status: appointment.status,
    createdAt: appointment.createdAt?.toISOString?.() || String(appointment.createdAt),
    updatedAt: appointment.updatedAt?.toISOString?.() || String(appointment.updatedAt),
  };
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await checkAdminApi();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasPermission(session, "agenda", "visualizar")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const id = await getId(ctx);
  const appointment = await getAppointmentFromDb(id);

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(mapAppointment(await decryptData(appointment)));
}

async function _PUT(request: Request, ctx: Ctx) {
  const session = await checkAdminApi();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasPermission(session, "agenda", "editar")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const id = await getId(ctx);
    const body = await request.json();
    const validated = updateAppointmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    if (Object.keys(validated.data).length === 0) {
      return NextResponse.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    const encryptedBody = await encryptData(validated.data);

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(encryptedBody.scheduledAt ? { scheduledAt: encryptedBody.scheduledAt } : {}),
        ...(encryptedBody.serviceType ? { serviceType: encryptedBody.serviceType } : {}),
        ...(typeof encryptedBody.estimatedValue === "number"
          ? { estimatedValue: encryptedBody.estimatedValue }
          : {}),
        
        ...(encryptedBody.status ? { status: encryptedBody.status } : {}),
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
    return NextResponse.json(mapAppointment(await decryptData(updated)));
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export const PUT = withAudit(_PUT, {
  resource: "agenda",
  getResourceId: getId,
  getResourceName: (data: any) => data.serviceType,
  getUrl: async (ctx) => {
    const params = await ctx.params;
    return `/admin/agenda?agendamentoId=${params.id}`;
  },
});

async function _DELETE(_req: Request, ctx: Ctx) {
  const session = await checkAdminApi();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!hasPermission(session, "agenda", "deletar")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const id = await getId(ctx);

    const deleted = await prisma.appointment.delete({
      where: { id },
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
    return NextResponse.json(mapAppointment(await decryptData(deleted)));
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    console.error("Erro ao deletar agendamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export const DELETE = withAudit(_DELETE, {
  resource: "agenda",
  getResourceId: getId,
  getResourceName: (data: any) => data.serviceType,
  getUrl: async (ctx) => {
    const params = await ctx.params;
    return `/admin/agenda?agendamentoId=${params.id}`;
  },
});
