import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "produtos", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");
    const query = searchParams.get("query") || "";

    const where: any = query
        ? { productName: { contains: query, mode: "insensitive" } }
        : {};

    const [movements, total] = await Promise.all([
        prisma.stockMovement.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.stockMovement.count({ where }),
    ]);

    return NextResponse.json({ movements, total, page, totalPages: Math.ceil(total / limit), limit });
}
