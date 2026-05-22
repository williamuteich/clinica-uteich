import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { adminSchema } from "@/src/schemas/admin";
import { withAudit } from "@/src/lib/audit";
import { revalidateTag } from "next/cache";

async function _DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (!hasPermission(session, "usuarios", "deletar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const adminToDelete = await prisma.administrator.findUnique({
            where: { id },
            include: { role: true }
        });

        if (adminToDelete?.role?.name === "Admin") {
            return NextResponse.json({ error: "O cargo de Admin não pode ser removido." }, { status: 403 });
        }

        await prisma.administrator.delete({
            where: { id },
        });
        revalidateTag("usuarios-list", "max");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar administrador:", error);
        return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
    }
}

const getIdFromCtx = async (ctx: { params?: Promise<{ id: string }> }) =>
    (await ctx.params!).id;

export const DELETE = withAudit(_DELETE, { resource: "usuarios", getResourceId: getIdFromCtx });

async function _PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (!hasPermission(session, "usuarios", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const adminToUpdate = await prisma.administrator.findUnique({
            where: { id },
            include: { role: true }
        });

        if (adminToUpdate?.role?.name === "Admin") {
            return NextResponse.json({ error: "O cargo de Admin não pode ser alterado por aqui." }, { status: 403 });
        }

        const body = await request.json();
        
        const validated = adminSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }
        
        const { email, name, roleId, active } = validated.data;

        const admin = await prisma.administrator.update({
            where: { id },
            data: {
                email,
                name,
                roleId: roleId ?? null,
                active,
            },
        });

        revalidateTag("usuarios-list", "max");
        return NextResponse.json(admin);
    } catch (error) {
        console.error("Erro ao atualizar administrador:", error);
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, { resource: "usuarios", getResourceId: getIdFromCtx });
