import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { roleSchema } from "@/src/schemas/roles";
import { withAudit } from "@/src/lib/audit";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

async function getRolesFromDb() {
    "use cache";
    cacheLife("hours");
    cacheTag("roles-list");

    return prisma.adminRole.findMany({
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            description: true,
            permissions: {
                select: {
                    permission: {
                        select: {
                            resource: true,
                            action: true,
                        }
                    }
                }
            }
        }
    });
}

export async function GET() {
    const session = await checkAdminApi();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const roles = await getRolesFromDb();
        return NextResponse.json(roles);
    } catch (error) {
        console.error("Erro ao buscar cargos:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

async function _POST(request: Request) {
    const session = await checkAdminApi();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!hasPermission(session, "cargos", "criar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const body = await request.json();

        const validated = roleSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { name, description, permissions } = validated.data;

        const role = await prisma.$transaction(async (tx) => {
            const newRole = await tx.adminRole.create({
                data: { name, description },
            });

            for (const perm of permissions) {
                const permission = await tx.adminPermission.upsert({
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

                await tx.adminRolePermission.create({
                    data: {
                        adminRoleId: newRole.id,
                        adminPermissionId: permission.id,
                    },
                });
            }

            return tx.adminRole.findUnique({
                where: { id: newRole.id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    permissions: {
                        select: {
                            permission: {
                                select: { resource: true, action: true }
                            }
                        }
                    }
                }
            });
        });

        revalidateTag("roles-list", "max");
        return NextResponse.json(role, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Cargo já existe" }, { status: 400 });
        }
        console.error("Erro ao criar cargo:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, { resource: "cargos" });