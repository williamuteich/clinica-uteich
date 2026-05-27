import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { trabalhoSchema } from "@/src/schemas/trabalho";
import { withAudit } from "@/src/lib/audit";

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const query = searchParams.get("query") || "";
    const atrasado = searchParams.get("atrasado") === "true";

    const where: any = {};
    if (status) {
        where.status = status;
    }
    if (query) {
        where.OR = [
            { nomePaciente: { contains: query, mode: "insensitive" } },
            { laboratorio: { contains: query, mode: "insensitive" } },
            { nomeTrabalho: { contains: query, mode: "insensitive" } },
        ];
    }
    if (atrasado) {
        where.status = "EM_ANDAMENTO";
        where.previsaoRetorno = { lt: new Date() };
    }

    const [trabalhos, total] = await Promise.all([
        prisma.trabalhoProtetico.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.trabalhoProtetico.count({ where }),
    ]);

    return NextResponse.json({
        trabalhos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
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
        const validated = trabalhoSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const data = validated.data;

        const trabalho = await prisma.$transaction(async (tx) => {
            const created = await tx.trabalhoProtetico.create({
                data: {
                    ...data,
                    createdBy: session.user.id,
                },
            });

            if (data.pacienteId) {
                await tx.patientHistory.create({
                    data: {
                        patientId: data.pacienteId,
                        description: `Trabalho protético registrado: "${data.nomeTrabalho}" enviado para o laboratório "${data.laboratorio}".`,
                    },
                });
            }

            return created;
        });

        return NextResponse.json(trabalho, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar trabalho protético:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "pacientes",
    getResourceName: (data: any) => `${data.nomeTrabalho} (${data.nomePaciente})`,
});
