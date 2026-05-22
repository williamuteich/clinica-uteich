import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";

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

        const [admins, total, roles] = await Promise.all([
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
            prisma.adminRole.findMany({
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
            }),
        ]);

        return NextResponse.json({
            admins,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            roles,
        });
    } catch (error) {
        console.error("Erro ao buscar dados de usuários:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
