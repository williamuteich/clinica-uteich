import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { protheticWorkSchema } from "@/src/schemas/trabalho";
import { withAudit } from "@/src/lib/audit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    const protheticWork = await prisma.protheticWork.findUnique({
        where: { id },
    });

    if (!protheticWork) {
        return NextResponse.json({ error: "Trabalho protético não encontrado" }, { status: 404 });
    }

    return NextResponse.json(protheticWork);
}

async function _PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const validated = protheticWorkSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { patientId, ...rest } = validated.data;

        const original = await prisma.protheticWork.findUnique({
            where: { id },
            select: { status: true },
        });

        if (!original) {
            return NextResponse.json({ error: "Trabalho protético não encontrado" }, { status: 404 });
        }

        const protheticWork = await prisma.$transaction(async (tx) => {
            const updated = await tx.protheticWork.update({
                where: { id },
                data: {
                    ...rest,
                    patientId: patientId || null,
                    description: rest.description ?? "",
                } as any,
            });

            if (patientId && original.status !== rest.status) {
                const statusLabel = rest.status === "PENDING" ? "Pendente" : "Concluído";

                await tx.patientHistory.create({
                    data: {
                        patientId: patientId,
                        description: `Trabalho protético "${rest.workName}" alterou status para: ${statusLabel}.`,
                    },
                });
            }

            return updated;
        });

        return NextResponse.json(protheticWork);
    } catch (error) {
        console.error("Erro ao atualizar trabalho protético:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "pacientes",
    getResourceName: (data: any) => `${data.workName} (${data.patientName})`,
});

async function _DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "deletar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const original = await prisma.protheticWork.findUnique({
            where: { id },
            select: { patientId: true, workName: true },
        });

        if (!original) {
            return NextResponse.json({ error: "Trabalho protético não encontrado" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.protheticWork.delete({ where: { id } });

            if (original.patientId) {
                await tx.patientHistory.create({
                    data: {
                        patientId: original.patientId,
                        description: `Trabalho protético "${original.workName}" foi removido do sistema.`,
                    },
                });
            }
        });

        return NextResponse.json(original);
    } catch (error) {
        console.error("Erro ao excluir trabalho protético:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const DELETE = withAudit(_DELETE, {
    resource: "pacientes",
    getResourceName: (data: any) => data?.workName ? `Trabalho removido: ${data.workName}` : "Trabalho removido",
});
