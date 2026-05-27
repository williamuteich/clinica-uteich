"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Trabalho, TrabalhosResponse, DashboardStats } from "@/src/types/trabalho";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getTrabalhos(filters: { page?: number; limit?: number; status?: string; query?: string; atrasado?: boolean } = { page: 1, limit: 20 }): Promise<TrabalhosResponse | null> {
    const cookie = (await headers()).get("cookie") || "";
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.status) params.set("status", filters.status);
    if (filters.query) params.set("query", filters.query);
    if (filters.atrasado !== undefined) params.set("atrasado", String(filters.atrasado));

    const query = params.toString();
    const res = await fetch(
        `${API_URL}/api/admin/trabalhos${query ? `?${query}` : ""}`,
        { headers: { Cookie: cookie } }
    );

    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Erro ao buscar trabalhos protéticos");
    return res.json();
}

export async function getTrabalho(id: string): Promise<Trabalho | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/${id}`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function getTrabalhoDashboard(): Promise<DashboardStats> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/dashboard`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return { ativos: 0, atrasados: 0, recebidosHoje: 0 };
    return res.json();
}

export async function createTrabalho(data: Omit<Trabalho, "id">): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar trabalho protético" };
    revalidatePath("/admin/trabalhos");
    if (data.pacienteId) {
        revalidatePath(`/admin/pacientes/${data.pacienteId}`);
    }
    return { success: true };
}

export async function updateTrabalho(id: string, data: Omit<Trabalho, "id">): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/${id}`, {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar trabalho protético" };
    revalidatePath("/admin/trabalhos");
    revalidatePath(`/admin/trabalhos/${id}`);
    if (data.pacienteId) {
        revalidatePath(`/admin/pacientes/${data.pacienteId}`);
    }
    return { success: true };
}

export async function deleteTrabalho(id: string, pacienteId?: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/trabalhos/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir trabalho protético" };
    revalidatePath("/admin/trabalhos");
    if (pacienteId) {
        revalidatePath(`/admin/pacientes/${pacienteId}`);
    }
    return { success: true };
}
