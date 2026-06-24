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
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";

        const rawLeads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" }
        });

        const decryptedLeads = [];
        for (const raw of rawLeads) {
            decryptedLeads.push({
                id: raw.id,
                name: await tryDecrypt(raw.name),
                phone: await tryDecrypt(raw.phone),
                serviceType: await tryDecrypt(raw.serviceType),
                observation: await tryDecrypt(raw.observation),
                status: raw.status,
                step: raw.step,
                appointmentId: raw.appointmentId,
                utmSource: raw.utmSource,
                utmMedium: raw.utmMedium,
                utmCampaign: raw.utmCampaign,
                utmContent: raw.utmContent,
                utmTerm: raw.utmTerm,
                createdAt: raw.createdAt.toISOString(),
                updatedAt: raw.updatedAt.toISOString(),
            });
        }

        let filtered = decryptedLeads;
        if (status) {
            filtered = filtered.filter(l => l.status === status);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(l => 
                l.name.toLowerCase().includes(searchLower) ||
                l.phone.replace(/\D/g, "").includes(searchLower.replace(/\D/g, ""))
            );
        }

        const total = rawLeads.length;
        const interested = rawLeads.filter(l => l.status === "INTERESTED").length;
        const converted = rawLeads.filter(l => l.status === "CONFIRMED" || l.status === "COMPLETED").length;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

        const stats = {
            total,
            interested,
            converted,
            conversionRate
        };

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            leads: paginated,
            stats,
            total: totalItems,
            page,
            limit,
            totalPages
        });
    } catch (error) {
        console.error("Erro ao buscar leads no admin:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
