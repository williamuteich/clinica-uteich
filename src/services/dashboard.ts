import { DashboardResponse } from "@/src/types/dashboard/dashboard";
import { headers } from "next/headers";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getDashboardStats(): Promise<DashboardResponse | null> {
    try {
        const cookie = (await headers()).get("cookie") || "";
        const res = await fetch(
            `${API_URL}/api/admin/dashboard`,
            {
                headers: { Cookie: cookie },
                next: { tags: ["dashboard-stats"] }
            }
        );

        if (res.status === 403 || res.status === 401) {
            return null;
        }
        if (!res.ok) {
            throw new Error("Erro ao buscar estatísticas do dashboard");
        }
        return res.json();
    } catch (error) {
        console.error("Erro no getDashboardStats service:", error);
        return null;
    }
}
