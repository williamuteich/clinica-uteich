import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { pacienteSchema, pacienteQuerySchema } from "@/src/schemas/paciente";
import { withAudit } from "@/src/lib/audit";
import { encrypt, decrypt, encryptDeterministic } from "@/src/lib/encrypted-fields";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

const ENCRYPTED_FIELDS = [
    { name: "cpf", action: encryptDeterministic, shouldProcess: (val: string) => !val.includes(":") },
    { name: "phone", action: encrypt, shouldProcess: (val: string) => !val.includes(":") },
    { name: "number", action: encrypt, shouldProcess: (val: string) => !val.includes(":") },
    { name: "complement", action: encrypt, shouldProcess: (val: string) => !val.includes(":") },
] as const;

const DECRYPT_FIELDS = [
    { name: "cpf", action: decrypt, shouldProcess: (val: string) => val.includes(":") },
    { name: "phone", action: decrypt, shouldProcess: (val: string) => val.includes(":") },
    { name: "number", action: decrypt, shouldProcess: (val: string) => val.includes(":") },
    { name: "complement", action: decrypt, shouldProcess: (val: string) => val.includes(":") },
] as const;

async function processData(data: any, fields: typeof ENCRYPTED_FIELDS | typeof DECRYPT_FIELDS) {
    if (!data) return data;
    const res = { ...data };
    for (const field of fields) {
        const val = res[field.name];
        if (typeof val === "string" && val.trim() !== "" && field.shouldProcess(val)) {
            try {
                res[field.name] = await field.action(val);
            } catch (error) {
                console.error("Erro ao criptografar campo", field.name, "valor", val, "erro", error);
                throw error;
            }
        }
    }
    return res;
}

const encryptData = (data: any) => processData(data, ENCRYPTED_FIELDS);
const decryptData = (data: any) => processData(data, DECRYPT_FIELDS);

async function getPacientesFromDb(where: any, page: number, limit: number) {
    "use cache";
    cacheLife("hours");
    cacheTag("pacientes-list");

    const dataRequisicao = new Date().toISOString();

    const [pacientes, total] = await Promise.all([
        prisma.patient.findMany({
            where,
            orderBy: { name: "asc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.patient.count({ where }),
    ]);

    return { pacientes, total, dataRequisicao };
}

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const validated = pacienteQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!validated.success) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });

    const { page, limit, name, cpf } = validated.data;

    const searchCpf = cpf ? await encryptDeterministic(cpf) : undefined;

    const where = {
        ...(name && { name: { contains: name, mode: "insensitive" as const } }),
        ...(searchCpf && { cpf: searchCpf }),
    };

    const { pacientes, total, dataRequisicao } = await getPacientesFromDb(where, page, limit);

    const decryptedPacientes = await Promise.all(pacientes.map(p => decryptData(p)));

    return NextResponse.json({
        pacientes: decryptedPacientes,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
        dataRequisicao,
    });
}

async function _POST(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "criar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validated = pacienteSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { birthDate, ...rest } = validated.data;

        const encryptedBody = await encryptData(rest);

        const paciente = await prisma.patient.create({
            data: {
                ...encryptedBody,
                birthDate: new Date(birthDate),
            },
        });

        revalidateTag("pacientes-list", "max");

        return NextResponse.json(await decryptData(paciente), { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
        console.error("Erro ao criar paciente:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "pacientes",
    getResourceName: (data: any) => data.name,
});
