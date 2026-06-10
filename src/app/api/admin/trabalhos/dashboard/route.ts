import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";

export async function GET() {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const [pendentes, concluidos] = await Promise.all([
        prisma.trabalhoProtetico.count({ where: { status: "PENDENTE" } }),
        prisma.trabalhoProtetico.count({ where: { status: "CONCLUIDO" } }),
    ]);

    return NextResponse.json({ pendentes, concluidos });
}
