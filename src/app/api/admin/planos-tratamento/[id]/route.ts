import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi } from "@/src/lib/auth-helpers-server";
import { updateTreatmentSchema } from "@/src/schemas/plano-tratamento";
import { withAudit } from "@/src/lib/audit";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

async function _PUT(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    try {
        const id = await getId(ctx);
        const body = await request.json();

        const result = updateTreatmentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const data = result.data;
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.valuePrivate !== undefined) updateData.valuePrivate = data.valuePrivate;
        if (data.valuePlan !== undefined) updateData.valuePlan = data.valuePlan;
        if (data.active !== undefined) updateData.active = data.active;

        const treatment = await prisma.treatment.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(treatment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
    }
}

async function _DELETE(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    try {
        const id = await getId(ctx);
        const treatment = await prisma.treatment.delete({
            where: { id },
        });

        return NextResponse.json(treatment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
    }
}

export const PUT = withAudit(_PUT, {
    resource: "planos-tratamento",
    getResourceId: getId,
    getResourceName: (data: any) => data?.name,
});

export const DELETE = withAudit(_DELETE, {
    resource: "planos-tratamento",
    getResourceId: getId,
    getResourceName: (data: any) => data?.name,
});
