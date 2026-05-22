import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { withAudit } from "@/src/lib/audit";
import { encrypt, decrypt } from "@/src/lib/encrypted-fields";
import { odontogramSchema } from "@/src/schemas/odontograma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

const ENCRYPTED_FIELDS = [
    { name: "customName", action: encrypt, shouldProcess: (val: string) => !val.includes(":") && val.trim() !== "" },
    { name: "notes", action: encrypt, shouldProcess: (val: string) => !val.includes(":") && val.trim() !== "" },
] as const;

const DECRYPT_FIELDS = [
    { name: "customName", action: decrypt, shouldProcess: (val: string) => val.includes(":") && val.trim() !== "" },
    { name: "notes", action: decrypt, shouldProcess: (val: string) => val.includes(":") && val.trim() !== "" },
] as const;

async function processData(data: any, fields: typeof ENCRYPTED_FIELDS | typeof DECRYPT_FIELDS): Promise<any> {
    if (!data) return data;

    if (Array.isArray(data)) {
        return Promise.all(data.map(item => processData(item, fields)));
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

    if (res.teeth && Array.isArray(res.teeth)) {
        res.teeth = await Promise.all(res.teeth.map((t: any) => processData(t, fields)));
    }

    return res;
}

const encryptData = (data: any) => processData(data, ENCRYPTED_FIELDS);
const decryptData = (data: any) => processData(data, DECRYPT_FIELDS);

async function getOdontogramaFromDb(patientId: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("odontograma-list");

    return prisma.odontogram.findUnique({
        where: { patientId },
        include: { teeth: true }
    });
}

export async function GET(_req: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const id = await getId(ctx);
    const odontogram = await getOdontogramaFromDb(id);

    if (!odontogram) {
        return NextResponse.json({ message: "Odontograma não encontrado" }, { status: 404 });
    }

    return NextResponse.json(await decryptData(odontogram));
}

async function _POST(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const id = await getId(ctx);
        const body = await request.json();
        const validated = odontogramSchema.safeParse({ ...body, patientId: id });
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const encryptedBody = await encryptData(validated.data);
        const { id: _removedId, teeth, ...odontogramRest } = encryptedBody;

        const odontogram = await prisma.$transaction(async (tx) => {
            const created = await tx.odontogram.create({
                data: {
                    patientId: id,
                    ...odontogramRest,
                    teeth: {
                        create: teeth.map((t: any) => ({
                            toothKey: t.toothKey,
                            isCustom: t.isCustom,
                            customName: t.customName,
                            status: t.status,
                            notes: t.notes
                        }))
                    }
                },
                include: { teeth: true }
            });
            return created;
        });

        revalidateTag("odontograma-list", "max");
        return NextResponse.json(await decryptData(odontogram), { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar odontograma:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "paciente/odontograma",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Odontograma";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}?tab=odontograma`;
    }
});

async function _PUT(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const id = await getId(ctx);
        const body = await request.json();
        const { id: odontogramId, teeth, ...rest } = body;

        if (!odontogramId) {
            return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
        }

        const validated = odontogramSchema.safeParse({ id: odontogramId, teeth, ...rest, patientId: id });
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const encryptedBody = await encryptData(validated.data);
        const { id: _removedId, teeth: teethList, ...odontogramRest } = encryptedBody;

        const updatedOdontogram = await prisma.$transaction(async (tx) => {
            await tx.tooth.deleteMany({
                where: { odontogramId }
            });

            return await tx.odontogram.update({
                where: { id: odontogramId },
                data: {
                    ...odontogramRest,
                    teeth: {
                        create: (teethList || []).map((t: any) => ({
                            toothKey: t.toothKey,
                            isCustom: t.isCustom,
                            customName: t.customName,
                            status: t.status,
                            notes: t.notes
                        }))
                    }
                },
                include: { teeth: true }
            });
        });

        revalidateTag("odontograma-list", "max");
        return NextResponse.json(await decryptData(updatedOdontogram));
    } catch (error: any) {
        console.error("Erro ao atualizar odontograma:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "paciente/odontograma",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Odontograma";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}?tab=odontograma`;
    }
});
