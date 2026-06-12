"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ProtheticWork, ProtheticWorksResponse, DashboardStats } from "@/src/types/dashboard/trabalho";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getProtheticWorks(filters: { page?: number; limit?: number; status?: string; query?: string } = { page: 1, limit: 20 }): Promise<ProtheticWorksResponse | null> {
    const cookie = (await headers()).get("cookie") || "";
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.status) params.set("status", filters.status);
    if (filters.query) params.set("query", filters.query);

    const query = params.toString();
    const res = await fetch(
        `${API_URL}/api/admin/trabalhos${query ? `?${query}` : ""}`,
        { headers: { Cookie: cookie } }
    );

    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Erro ao buscar trabalhos");
    return res.json();
}

export async function getProtheticWorkDashboard(): Promise<DashboardStats> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/dashboard`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return { pending: 0, done: 0 };
    return res.json();
}

export async function createProtheticWork(data: Omit<ProtheticWork, "id">): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar trabalho" };
    revalidatePath("/admin/trabalhos");
    if (data.patientId) revalidatePath(`/admin/pacientes/${data.patientId}`);
    return { success: true };
}

export async function updateProtheticWork(id: string, data: Omit<ProtheticWork, "id">): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/${id}`, {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar trabalho" };
    revalidatePath("/admin/trabalhos");
    revalidatePath(`/admin/trabalhos/${id}`);
    if (data.patientId) revalidatePath(`/admin/pacientes/${data.patientId}`);
    return { success: true };
}

export async function deleteProtheticWork(id: string, patientId?: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir trabalho" };
    revalidatePath("/admin/trabalhos");
    if (patientId) revalidatePath(`/admin/pacientes/${patientId}`);
    return { success: true };
}
