"use server";
import { GetLeadsResponse } from "@/src/types/dashboard/leads";
import { headers } from "next/headers";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getLeads(filters: { page?: number; limit?: number; search?: string; status?: string } = { page: 1, limit: 20 }): Promise<GetLeadsResponse | null> {
    try {
        const cookie = (await headers()).get("cookie") || "";
        const params = new URLSearchParams();
        if (filters.page) params.set("page", String(filters.page));
        if (filters.limit) params.set("limit", String(filters.limit));
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);

        const query = params.toString();
        const res = await fetch(
            `${API_URL}/api/admin/leads${query ? `?${query}` : ""}`,
            {
                headers: { Cookie: cookie },
                next: { tags: ["leads-list"] }
            }
        );

        if (res.status === 403 || res.status === 401) return null;
        if (!res.ok) throw new Error("Erro ao buscar leads");
        return res.json();
    } catch (error) {
        console.error("Erro no getLeads service:", error);
        return null;
    }
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const cookie = (await headers()).get("cookie") || "";
        const res = await fetch(`${API_URL}/api/admin/leads/${id}`, {
            method: "DELETE",
            headers: { Cookie: cookie },
        });

        const result = await res.json();
        if (!res.ok) return { success: false, error: result.error || "Erro ao deletar lead" };
        return { success: true };
    } catch (error) {
        console.error("Erro no deleteLead service:", error);
        return { success: false, error: "Erro ao deletar lead" };
    }
}

export async function exportLeads(): Promise<any[] | null> {
    try {
        const cookie = (await headers()).get("cookie") || "";
        const res = await fetch(`${API_URL}/api/admin/leads/export`, {
            headers: { Cookie: cookie },
        });

        if (res.status === 403 || res.status === 401) return null;
        if (!res.ok) throw new Error("Erro ao exportar leads");
        return res.json();
    } catch (error) {
        console.error("Erro no exportLeads service:", error);
        return null;
    }
}
