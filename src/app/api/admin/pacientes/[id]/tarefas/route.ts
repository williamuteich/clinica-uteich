import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { taskSchema, taskQuerySchema } from "@/src/schemas/tarefa";
import { withAudit } from "@/src/lib/audit";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

export async function GET(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const id = await getId(ctx);
    const { searchParams } = new URL(request.url);
    const query = taskQuerySchema.safeParse({ completed: searchParams.get("completed") ?? undefined });

    const where: any = { patientId: id };
    if (query.success && query.data.completed !== undefined) {
        where.completed = query.data.completed === "true";
    }

    const tasks = await prisma.patientTask.findMany({
        where,
        orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tasks, total: tasks.length });
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
        const validated = taskSchema.safeParse({ ...body, patientId: id });
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const task = await prisma.patientTask.create({
            data: {
                patientId: id,
                title: validated.data.title,
                description: validated.data.description ?? null,
                dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "paciente/tarefas",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}`;
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
        const { taskId, title, description, dueDate, completed } = body;

        if (!taskId) {
            return NextResponse.json({ error: "ID da tarefa é obrigatório" }, { status: 400 });
        }

        const data: any = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
        if (completed !== undefined) data.completed = completed;

        const task = await prisma.patientTask.update({
            where: { id: taskId },
            data,
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "paciente/tarefas",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}`;
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
        const taskId = searchParams.get("taskId");

        if (!taskId) {
            return NextResponse.json({ error: "ID da tarefa é obrigatório" }, { status: 400 });
        }

        await prisma.patientTask.delete({ where: { id: taskId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const DELETE = withAudit(_DELETE, {
    resource: "paciente/tarefas",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}`;
    }
});
