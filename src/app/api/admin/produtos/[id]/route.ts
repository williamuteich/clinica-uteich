import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { productSchema } from "@/src/schemas/produto";
import { withAudit } from "@/src/lib/audit";

async function _PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "produtos", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const validated = productSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

        const updated = await prisma.product.update({
            where: { id },
            data: {
                name: validated.data.name,
                quantity: validated.data.quantity,
                minimumQuantity: validated.data.minimumQuantity,
                expirationDate: validated.data.expirationDate ? new Date(validated.data.expirationDate) : null,
                notes: validated.data.notes ?? null,
            },
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "produtos",
    getResourceName: (data: any) => data?.name,
});

async function _DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "produtos", "deletar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

        await prisma.$transaction([
            prisma.stockMovement.create({
                data: {
                    productId: existing.id,
                    productName: existing.name,
                    quantity: null,
                    type: "Exclusão de produto",
                    performedBy: session.user.name ?? session.user.email ?? "Sistema",
                },
            }),
            prisma.stockMovement.deleteMany({ where: { productId: id } }),
            prisma.product.delete({ where: { id } }),
        ]);

        return NextResponse.json(existing);
    } catch {
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const DELETE = withAudit(_DELETE, {
    resource: "produtos",
    getResourceName: (data: any) => data?.name ? `Produto removido: ${data.name}` : "Produto removido",
});
