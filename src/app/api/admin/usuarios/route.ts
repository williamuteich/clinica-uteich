import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { adminSchema } from "@/src/schemas/admin";
import { withAudit } from "@/src/lib/audit";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

async function getUsuariosFromDb(where: any, page: number, limit: number) {
    "use cache";
    cacheLife("hours");
    cacheTag("usuarios-list");

    const [admins, total] = await Promise.all([
        prisma.administrator.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                active: true,
                lastLogin: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.administrator.count({ where }),
    ]);

    return { admins, total };
}

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!hasPermission(session, "usuarios", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
        const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
        const name = searchParams.get("name") || undefined;

        const where = {
            ...(name && {
                name: {
                    contains: name,
                    mode: "insensitive" as const,
                },
            }),
        };

        const { admins, total } = await getUsuariosFromDb(where, page, limit);

        return NextResponse.json({
            admins,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Erro ao buscar administradores:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}


async function _POST(request: Request) {
    const session = await checkAdminApi();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!hasPermission(session, "usuarios", "criar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const body = await request.json();

        const validated = adminSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { email, name, roleId } = validated.data;

        const exists = await prisma.administrator.findUnique({
            where: { email },
        });

        if (exists) {
            return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
        }

        const admin = await prisma.administrator.create({
            data: {
                email,
                name,
                roleId: roleId ?? null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                active: true,
                createdAt: true,
            },
        });

        revalidateTag("usuarios-list", "max");
        return NextResponse.json(admin, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar administrador:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, { resource: "usuarios" });