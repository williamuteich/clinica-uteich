import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { evolutionSchema } from "@/src/schemas/paciente";
import { withAudit } from "@/src/lib/audit";
import { encrypt, decrypt } from "@/src/lib/encrypted-fields";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

const ENCRYPTED_FIELDS = [
    { name: "description", action: encrypt, shouldProcess: (val: string) => !val.includes(":") },
] as const;

const DECRYPT_FIELDS = [
    { name: "description", action: decrypt, shouldProcess: (val: string) => val.includes(":") },
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
                console.error("Erro ao criptografar/descriptografar campo", field.name, "valor", val, "erro", error);
                throw error;
            }
        }
    }
    return res;
}

const encryptData = (data: any) => processData(data, ENCRYPTED_FIELDS);
const decryptData = (data: any) => processData(data, DECRYPT_FIELDS);

async function getHistoricoFromDb(patientId: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("historico-list");

    return prisma.patientHistory.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" }
    });
}

export async function GET(_req: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const id = await getId(ctx);
    const patientHistories = await getHistoricoFromDb(id);

    return NextResponse.json(await decryptData(patientHistories));
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
        const validated = evolutionSchema.safeParse({ ...body, patientId: id });
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const encryptedBody = await encryptData({ description: validated.data.description });

        const history = await prisma.patientHistory.create({
            data: {
                patientId: id,
                description: encryptedBody.description,
            },
        });

        revalidateTag("historico-list", "max");
        return NextResponse.json(await decryptData(history), { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar historico:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "paciente/evoluções",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}?tab=evolucao`;
    }
});

async function _PUT(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { historyId, description } = body;

        if (!historyId || !description || description.trim().length < 3) {
            return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
        }

        const encryptedBody = await encryptData({ description });

        const updatedHistory = await prisma.patientHistory.update({
            where: { id: historyId },
            data: {
                description: encryptedBody.description,
            },
        });

        revalidateTag("historico-list", "max");
        return NextResponse.json(await decryptData(updatedHistory));
    } catch (error: any) {
        console.error("Erro ao atualizar historico:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "paciente/evoluções",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}?tab=evolucao`;
    }
});

async function _DELETE(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "deletar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const historyId = searchParams.get("historyId");

        if (!historyId) {
            return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
        }

        const deletedHistory = await prisma.patientHistory.delete({
            where: { id: historyId },
        });

        revalidateTag("historico-list", "max");
        return NextResponse.json(await decryptData(deletedHistory));
    } catch (error: any) {
        console.error("Erro ao deletar historico:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const DELETE = withAudit(_DELETE, {
    resource: "paciente/evoluções",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}?tab=evolucao`;
    }
});


