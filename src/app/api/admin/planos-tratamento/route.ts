import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi } from "@/src/lib/auth-helpers-server";
import { treatmentSchema } from "@/src/schemas/plano-tratamento";
import { withAudit } from "@/src/lib/audit";

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const query = searchParams.get("query") || "";

    const where: any = {};
    if (category && category !== "Todos") {
        where.category = category;
    }
    if (query) {
        where.name = { contains: query, mode: "insensitive" };
    }

    try {
        const treatments = await prisma.treatment.findMany({
            where,
            orderBy: { name: "asc" },
        });

        const allTreatments = await prisma.treatment.findMany({
            select: { category: true }
        });

        const categoryCounts: Record<string, number> = { Todos: allTreatments.length };
        allTreatments.forEach((t) => {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        });

        return NextResponse.json({ treatments, categoryCounts });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
    }
}

async function _POST(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    try {
        const body = await request.json();

        const result = treatmentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const data = result.data;
        const treatment = await prisma.treatment.create({
            data: {
                name: data.name,
                category: data.category,
                valuePrivate: data.valuePrivate,
                valuePlan: data.valuePlan,
                active: data.active !== false,
            },
        });

        return NextResponse.json(treatment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "planos-tratamento",
    getResourceName: (data: any) => data?.name,
});
