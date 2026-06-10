import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { trabalhoSchema } from "@/src/schemas/trabalho";
import { withAudit } from "@/src/lib/audit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    const trabalho = await prisma.trabalhoProtetico.findUnique({
        where: { id },
    });

    if (!trabalho) {
        return NextResponse.json({ error: "Trabalho protético não encontrado" }, { status: 404 });
    }

    return NextResponse.json(trabalho);
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
        const validated = trabalhoSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { pacienteId, ...rest } = validated.data;

        const original = await prisma.trabalhoProtetico.findUnique({
            where: { id },
            select: { status: true },
        });

        if (!original) {
            return NextResponse.json({ error: "Trabalho protético não encontrado" }, { status: 404 });
        }

        const trabalho = await prisma.$transaction(async (tx) => {
            const updated = await tx.trabalhoProtetico.update({
                where: { id },
                data: {
                    ...rest,
                    pacienteId: pacienteId || null,
                    descricao: rest.descricao ?? "",
                } as any,
            });

            if (pacienteId && original.status !== rest.status) {
                let statusLabel = rest.status === "PENDENTE" ? "Pendente" : "Concluído";

                await tx.patientHistory.create({
                    data: {
                        patientId: pacienteId,
                        description: `Trabalho protético "${rest.nomeTrabalho}" alterou status para: ${statusLabel}.`,
                    },
                });
            }

            return updated;
        });

        return NextResponse.json(trabalho);
    } catch (error) {
        console.error("Erro ao atualizar trabalho protético:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "pacientes",
    getResourceName: (data: any) => `${data.nomeTrabalho} (${data.nomePaciente})`,
});

async function _DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "deletar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const original = await prisma.trabalhoProtetico.findUnique({
            where: { id },
            select: { pacienteId: true, nomeTrabalho: true },
        });

        if (!original) {
            return NextResponse.json({ error: "Trabalho protético não encontrado" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.trabalhoProtetico.delete({ where: { id } });

            if (original.pacienteId) {
                await tx.patientHistory.create({
                    data: {
                        patientId: original.pacienteId,
                        description: `Trabalho protético "${original.nomeTrabalho}" foi removido do sistema.`,
                    },
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao excluir trabalho protético:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const DELETE = withAudit(_DELETE, {
    resource: "pacientes",
    getResourceName: (data: any) => `Trabalho Removido: ${data.id}`,
});
