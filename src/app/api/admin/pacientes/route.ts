import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { pacienteSchema, pacienteQuerySchema } from "@/src/schemas/paciente";
import { withAudit } from "@/src/lib/audit";
import { encrypt, decrypt, encryptDeterministic, isEncrypted } from "@/src/lib/encrypted-fields";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

const ENCRYPTED_FIELDS = [
    { name: "cpf", action: encryptDeterministic, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "phone", action: encryptDeterministic, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "number", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "complement", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "representativeCpf", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "emergencyPhone", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
] as const;

const DECRYPT_FIELDS = [
    { name: "cpf", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "phone", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "number", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "complement", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "representativeCpf", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "emergencyPhone", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
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

    const { page, limit, name, cpf, phone } = validated.data;
    const dataRequisicao = new Date().toISOString();

    if (phone) {
        const cleanSearch = phone.replace(/\D/g, "");
        const searchNumber = cleanSearch.startsWith("55") && cleanSearch.length > 10 ? cleanSearch.slice(2) : cleanSearch;

        const allPatients = await prisma.patient.findMany({
            orderBy: { name: "asc" },
        });

        const matched: any[] = [];
        for (const p of allPatients) {
            try {
                const decryptedPhone = await decrypt(p.phone);
                const cleanDbPhone = decryptedPhone.replace(/\D/g, "");
                const dbNumber = cleanDbPhone.startsWith("55") && cleanDbPhone.length > 10 ? cleanDbPhone.slice(2) : cleanDbPhone;

                if (dbNumber === searchNumber) {
                    matched.push(p);
                }
            } catch (e) {
                console.error(`Erro ao descriptografar telefone do paciente ${p.id}:`, e);
            }
        }

        const paginated = matched.slice((page - 1) * limit, page * limit);
        const decryptedPacientes = await Promise.all(paginated.map(p => decryptData(p)));

        return NextResponse.json({
            pacientes: decryptedPacientes,
            total: matched.length,
            page,
            totalPages: Math.ceil(matched.length / limit),
            limit,
            dataRequisicao,
        });
    }

    const searchCpf = cpf ? await encryptDeterministic(cpf) : undefined;

    const where = {
        ...(name && { name: { contains: name, mode: "insensitive" as const } }),
        ...(searchCpf && { cpf: searchCpf }),
    };

    const { pacientes, total } = await getPacientesFromDb(where, page, limit);

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

        const { birthDate, representativeBirthDate, ...rest } = validated.data;

        if (rest.cpf) {
            const encryptedCpf = await encryptDeterministic(rest.cpf);
            const existingCpf = await prisma.patient.findFirst({ where: { cpf: encryptedCpf } });
            if (existingCpf) {
                return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
            }
        }

        if (rest.phone) {
            const cleanPhone = rest.phone.replace(/\D/g, "");
            const encryptedPhone = await encryptDeterministic(rest.phone);
            let phoneExists = false;

            const existingPhone = await prisma.patient.findFirst({ where: { phone: encryptedPhone } });
            if (existingPhone) {
                phoneExists = true;
            } else {
                const patients = await prisma.patient.findMany({ select: { id: true, phone: true } });
                for (const p of patients) {
                    try {
                        const decrypted = await decrypt(p.phone);
                        const cleanDbPhone = decrypted.replace(/\D/g, "");
                        if (cleanDbPhone === cleanPhone) {
                            phoneExists = true;
                            break;
                        }
                    } catch (e) {
                        console.error(`Erro ao descriptografar telefone do paciente ${p.id}:`, e);
                    }
                }
            }

            if (phoneExists) {
                return NextResponse.json({ error: "Telefone já cadastrado" }, { status: 400 });
            }
        }

        const encryptedBody = await encryptData(rest);

        const paciente = await prisma.patient.create({
            data: {
                ...encryptedBody,
                birthDate: new Date(birthDate),
                representativeBirthDate: representativeBirthDate ? new Date(representativeBirthDate) : null,
            },
        });

        revalidateTag("pacientes-list", "max");

        return NextResponse.json(await decryptData(paciente), { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") return NextResponse.json({ error: "Erro ao criar paciente" }, { status: 400 });
        console.error("Erro ao criar paciente:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "pacientes",
    getResourceName: (data: any) => data.name,
});
