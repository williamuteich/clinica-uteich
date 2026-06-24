import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { withAudit } from "@/src/lib/audit";
import { updateAppointmentSchema } from "@/src/schemas/agendamento";
import { revalidateTag } from "next/cache";
import { Appointment } from "@/src/types/dashboard/pacientes";
import { decrypt, encrypt, isEncrypted } from "@/src/lib/encrypted-fields";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

const ENCRYPTED_FIELDS = [
  { name: "serviceType", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) && val.trim() !== "" },
  { name: "description", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) && val.trim() !== "" },
  { name: "guestName", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) && val.trim() !== "" },
  { name: "guestPhone", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) && val.trim() !== "" },
] as const;

const DECRYPT_FIELDS = [
  { name: "serviceType", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) && val.trim() !== "" },
  { name: "description", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) && val.trim() !== "" },
  { name: "guestName", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) && val.trim() !== "" },
  { name: "guestPhone", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) && val.trim() !== "" },
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
          phone: true,
        },
      },
    },
  });
}

function mapAppointment(appointment: any): Appointment {
  return {
    id: appointment.id,
    patientId: appointment.patientId || null,
    patientName: appointment.patient?.name || appointment.guestName || "Paciente",
    guestName: appointment.guestName || null,
    guestPhone: appointment.guestPhone || null,
    phone: appointment.patient?.phone || appointment.guestPhone || null,
    scheduledAt: appointment.scheduledAt?.toISOString?.() || String(appointment.scheduledAt),
    serviceType: appointment.serviceType,
    estimatedValue: appointment.estimatedValue,
    status: appointment.status,
    description: appointment.description || null,
    billingType: appointment.billingType || "Particular",
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

  const decrypted = await decryptData(appointment);
  if (decrypted.patient?.phone) {
    try {
      decrypted.patient.phone = await decrypt(decrypted.patient.phone);
    } catch (err) {
      console.error("Erro ao descriptografar telefone do paciente:", err);
    }
  }

  return NextResponse.json(mapAppointment(decrypted));
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
        ...(encryptedBody.description !== undefined ? { description: encryptedBody.description } : {}),
        ...(encryptedBody.guestName !== undefined ? { guestName: encryptedBody.guestName } : {}),
        ...(encryptedBody.guestPhone !== undefined ? { guestPhone: encryptedBody.guestPhone } : {}),
        ...(encryptedBody.billingType !== undefined ? { billingType: encryptedBody.billingType } : {}),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    const decryptedUpdated = await decryptData(updated);

    if (encryptedBody.status) {
      try {
        await prisma.lead.updateMany({
          where: { appointmentId: id },
          data: { status: encryptedBody.status },
        });
      } catch (e) {
        console.error("Erro ao atualizar status do lead:", e);
      }
    }

    if (decryptedUpdated.patient?.phone) {
      try {
        decryptedUpdated.patient.phone = await decrypt(decryptedUpdated.patient.phone);
      } catch (err) {
        console.error("Erro ao descriptografar telefone do paciente atualizado:", err);
      }
    }

    revalidateTag("agenda-list", "max");
    return NextResponse.json(mapAppointment(decryptedUpdated));
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
            phone: true,
          },
        },
      },
    });

    const decryptedDeleted = await decryptData(deleted);

    try {
      await prisma.lead.updateMany({
        where: { appointmentId: id },
        data: { status: "CANCELLED" },
      });
    } catch (e) {
      console.error("Erro ao atualizar status do lead ao deletar agendamento:", e);
    }

    if (decryptedDeleted.patient?.phone) {
      try {
        decryptedDeleted.patient.phone = await decrypt(decryptedDeleted.patient.phone);
      } catch (err) {
        console.error("Erro ao descriptografar telefone do paciente deletado:", err);
      }
    }

    revalidateTag("agenda-list", "max");
    return NextResponse.json(mapAppointment(decryptedDeleted));
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
