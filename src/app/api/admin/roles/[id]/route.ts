import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { roleSchema } from "@/src/schemas/roles";
import { withAudit } from "@/src/lib/audit";
import { revalidateTag } from "next/cache";

async function _DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (!hasPermission(session, "cargos", "deletar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const roleToDelete = await prisma.adminRole.findUnique({
            where: { id },
            include: { _count: { select: { administrators: true } } }
        });

        if (roleToDelete?.name === "Admin") {
            return NextResponse.json({ error: "O cargo de Admin não pode ser removido." }, { status: 403 });
        }

        if (roleToDelete?._count?.administrators && roleToDelete._count.administrators > 0) {
            return NextResponse.json({ error: "Existem administradores vinculados a este cargo. Não é possível excluir." }, { status: 400 });
        }

        await prisma.adminRole.delete({
            where: { id },
        });
        revalidateTag("roles-list", "max");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar cargo:", error);
        return NextResponse.json({ error: "Erro ao deletar cargo. Verifique se existem usuários vinculados." }, { status: 500 });
    }
}

const getIdFromCtx = async (ctx: { params?: Promise<{ id: string }> }) =>
    (await ctx.params!).id;

export const DELETE = withAudit(_DELETE, { resource: "cargos", getResourceId: getIdFromCtx });

async function _PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (!hasPermission(session, "cargos", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const roleToUpdate = await prisma.adminRole.findUnique({
            where: { id }
        });

        if (roleToUpdate?.name === "Admin") {
            return NextResponse.json({ error: "O cargo de Admin não pode ser alterado por aqui." }, { status: 403 });
        }

        const body = await request.json();
        
        const validated = roleSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { name, description, permissions } = validated.data;

        const role = await prisma.adminRole.update({
            where: { id },
            data: { name, description },
        });

        if (permissions) {
            await prisma.adminRolePermission.deleteMany({
                where: { adminRoleId: id },
            });

            for (const perm of permissions) {
                const permission = await prisma.adminPermission.upsert({
                    where: {
                        resource_action: {
                            resource: perm.resource,
                            action: perm.action,
                        }
                    },
                    update: {},
                    create: {
                        resource: perm.resource,
                        action: perm.action,
                        description: `${perm.action} ${perm.resource}`,
                    },
                });

                await prisma.adminRolePermission.create({
                    data: {
                        adminRoleId: role.id,
                        adminPermissionId: permission.id,
                    },
                });
            }
        }

        revalidateTag("roles-list", "max");
        return NextResponse.json(role);
    } catch (error) {
        console.error("Erro ao atualizar cargo:", error);
        return NextResponse.json({ error: "Erro ao atualizar cargo" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, { resource: "cargos", getResourceId: getIdFromCtx });
