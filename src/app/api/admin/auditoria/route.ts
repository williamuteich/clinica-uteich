import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { auditQuerySchema } from "@/src/schemas/audit";
import { cacheLife, cacheTag } from "next/cache";

async function getAuditoriaFromDb(where: any, page: number, limit: number) {
    "use cache";
    cacheLife("hours");
    cacheTag("auditoria-list");

    const [logs, total] = await Promise.all([
        prisma.logAdmin.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                action: true,
                resource: true,
                resourceId: true,
                resourceName: true,
                url: true,
                createdAt: true,
                administrator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: {
                            select: { name: true },
                        },
                    },
                },
            },
        }),
        prisma.logAdmin.count({ where }),
    ]);

    return { logs, total };
}

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!hasPermission(session, "auditoria", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    
    const validated = auditQuerySchema.safeParse(queryData);
    if (!validated.success) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const { page, limit, resource, action, userName, administratorId } = validated.data;

    const where = {
        ...(resource && { resource }),
        ...(action && { action }),
        ...(administratorId && { administratorId }),
        ...(userName && {
            administrator: {
                name: {
                    contains: userName,
                    mode: "insensitive" as const,
                },
            },
        }),
    };

    try {
        const { logs, total } = await getAuditoriaFromDb(where, page, limit);

        return NextResponse.json({
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Erro ao buscar logs de auditoria:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
