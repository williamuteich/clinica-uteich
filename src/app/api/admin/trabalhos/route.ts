import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { protheticWorkSchema } from "@/src/schemas/trabalho";
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

    const where: any = {};
    if (status) where.status = status;
    if (query) {
        where.OR = [
            { patientName: { contains: query, mode: "insensitive" } },
            { laboratory: { contains: query, mode: "insensitive" } },
            { workName: { contains: query, mode: "insensitive" } },
        ];
    }

    const [protheticWorks, total] = await Promise.all([
        prisma.protheticWork.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.protheticWork.count({ where }),
    ]);

    return NextResponse.json({
        protheticWorks,
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
        const validated = protheticWorkSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { patientId, ...rest } = validated.data;

        const protheticWork = await prisma.$transaction(async (tx) => {
            const created = await tx.protheticWork.create({
                data: {
                    ...rest,
                    patientId: patientId || null,
                    description: rest.description ?? "",
                    createdBy: session.user.id,
                } as any,
            });

            if (patientId) {
                await tx.patientHistory.create({
                    data: {
                        patientId: patientId,
                        description: `Trabalho protético registrado: "${rest.workName}" enviado para o laboratório "${rest.laboratory}".`,
                    },
                });
            }

            return created;
        });

        return NextResponse.json(protheticWork, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar trabalho protético:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "pacientes",
    getResourceName: (data: any) => `${data.workName} (${data.patientName})`,
});
