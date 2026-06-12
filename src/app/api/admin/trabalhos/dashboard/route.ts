import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";

export async function GET() {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const [pending, done] = await Promise.all([
        prisma.protheticWork.count({ where: { status: "PENDING" } }),
        prisma.protheticWork.count({ where: { status: "DONE" } }),
    ]);

    return NextResponse.json({ pending, done });
}
