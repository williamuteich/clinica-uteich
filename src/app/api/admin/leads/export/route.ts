import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { decrypt, isEncrypted } from "@/src/lib/encrypted-fields";

async function tryDecrypt(val: string | null | undefined): Promise<string> {
    if (!val) return "";
    if (isEncrypted(val)) {
        try {
            return await decrypt(val);
        } catch (e) {
            return val;
        }
    }
    return val;
}

export async function GET(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const rawLeads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" }
        });

        const decryptedLeads = [];
        for (const raw of rawLeads) {
            decryptedLeads.push({
                name: await tryDecrypt(raw.name),
                phone: await tryDecrypt(raw.phone),
                serviceType: await tryDecrypt(raw.serviceType),
                observation: await tryDecrypt(raw.observation),
                status: raw.status,
                createdAt: raw.createdAt.toISOString(),
                utmSource: raw.utmSource || "",
                utmMedium: raw.utmMedium || "",
                utmCampaign: raw.utmCampaign || "",
                gclid: raw.gclid || "",
            });
        }

        return NextResponse.json(decryptedLeads);
    } catch (error) {
        console.error("Erro ao exportar leads:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
