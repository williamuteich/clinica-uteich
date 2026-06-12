import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { productSchema } from "@/src/schemas/produto";
import { withAudit } from "@/src/lib/audit";

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
        ? { name: { contains: query, mode: "insensitive" } }
        : {};

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { name: "asc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit), limit });
}

async function _POST(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "produtos", "criar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const items: any[] = Array.isArray(body) ? body : [body];

        const validated = items.map((item) => {
            const result = productSchema.safeParse(item);
            if (!result.success) throw new Error(result.error.issues[0].message);
            return result.data;
        });

        const created = await prisma.$transaction(
            validated.map((data) =>
                prisma.product.create({
                    data: {
                        name: data.name,
                        quantity: data.quantity,
                        minimumQuantity: data.minimumQuantity,
                        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
                        notes: data.notes ?? null,
                        createdBy: session.user.id,
                    },
                })
            )
        );

        await prisma.$transaction(
            created.map((p) =>
                prisma.stockMovement.create({
                    data: {
                        productId: p.id,
                        productName: p.name,
                        quantity: p.quantity,
                        type: "Cadastro de produto",
                        performedBy: session.user.name ?? session.user.email ?? "Sistema",
                    },
                })
            )
        );

        return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "produtos",
    getResourceName: (data: any) => Array.isArray(data) ? `${data.length} produto(s)` : data?.name,
});
