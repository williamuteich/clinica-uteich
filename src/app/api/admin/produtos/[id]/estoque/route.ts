import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { stockAdjustmentSchema } from "@/src/schemas/produto";
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
        const validated = stockAdjustmentSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const { delta, notes } = validated.data;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

        const newQty = Math.max(0, existing.quantity + delta);

        const [updated] = await prisma.$transaction([
            prisma.product.update({
                where: { id },
                data: { quantity: newQty },
            }),
            prisma.stockMovement.create({
                data: {
                    productId: id,
                    productName: existing.name,
                    quantity: delta,
                    type: delta >= 0 ? "Entrada de estoque" : "Saída de estoque",
                    notes: notes ?? null,
                    performedBy: session.user.name ?? session.user.email ?? "Sistema",
                },
            }),
        ]);

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "produtos",
    getResourceName: (data: any) => `${data?.name} (Ajuste de estoque: ${data?.quantity})`,
});
