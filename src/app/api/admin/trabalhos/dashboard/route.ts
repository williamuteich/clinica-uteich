import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";

export async function GET() {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const now = new Date();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [ativos, atrasados, recebidosHoje] = await Promise.all([
        prisma.trabalhoProtetico.count({
            where: { status: "EM_ANDAMENTO" },
        }),
        prisma.trabalhoProtetico.count({
            where: {
                status: "EM_ANDAMENTO",
                previsaoRetorno: { lt: now },
            },
        }),
        prisma.trabalhoProtetico.count({
            where: {
                dataRecebimento: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
        }),
    ]);

    return NextResponse.json({ ativos, atrasados, recebidosHoje });
}
