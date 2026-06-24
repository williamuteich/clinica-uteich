"use server";
import { prisma } from "@/src/lib/prisma";
import { decrypt, isEncrypted } from "@/src/lib/encrypted-fields";
import { Lead, LeadStats } from "@/src/types/dashboard/leads";

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

export async function getLeads(filters: { page?: number; limit?: number; search?: string; status?: string } = { page: 1, limit: 20 }) {
    try {
        const page = filters.page || 1;
        const limit = filters.limit || 20;

        const rawLeads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" }
        });

        const decryptedLeads: Lead[] = [];
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
        if (filters.status) {
            filtered = filtered.filter(l => l.status === filters.status);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(l => 
                l.name.toLowerCase().includes(searchLower) ||
                l.phone.replace(/\D/g, "").includes(searchLower.replace(/\D/g, ""))
            );
        }

        const total = rawLeads.length;
        const interested = rawLeads.filter(l => l.status === "INTERESTED").length;
        const converted = rawLeads.filter(l => l.status === "CONFIRMED" || l.status === "COMPLETED").length;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

        const stats: LeadStats = {
            total,
            interested,
            converted,
            conversionRate
        };

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return {
            leads: paginated,
            stats,
            total: totalItems,
            page,
            limit,
            totalPages
        };
    } catch (error) {
        console.error("Erro ao buscar leads:", error);
        return null;
    }
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.lead.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar lead:", error);
        return { success: false, error: "Erro ao deletar lead" };
    }
}
