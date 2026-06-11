"use server";
import { AgendamentoFilters, AgendamentosResponse, Appointment, CreateAgendamentoInput, UpdateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getAgendamentos(filters: AgendamentoFilters = { page: 1, limit: 20 }): Promise<AgendamentosResponse | null> {
    const cookie = (await headers()).get("cookie") || "";
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.patientId) params.set("patientId", filters.patientId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    const res = await fetch(
        `${API_URL}/api/admin/agenda${query ? `?${query}` : ""}`,
        { headers: { Cookie: cookie } }
    );

    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Erro ao buscar agendamentos");
    return res.json();
}

export async function createAgendamento(data: CreateAgendamentoInput): Promise<{ success: boolean; data?: Appointment; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/agenda`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar agendamento" };
    revalidatePath("/admin/agenda");
    revalidatePath(`/admin/pacientes/${data.patientId}`);
    return { success: true, data: result };
}

export async function getAgendamento(id: string): Promise<Appointment | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/agenda/${id}`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function updateAgendamento(id: string, data: UpdateAgendamentoInput): Promise<{ success: boolean; data?: Appointment; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/agenda/${id}`, {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar agendamento" };
    revalidatePath("/admin/agenda");
    revalidatePath(`/admin/pacientes/${result.patientId}`);
    return { success: true, data: result };
}

export async function deleteAgendamento(id: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/agenda/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir agendamento" };
    revalidatePath("/admin/agenda");
    revalidatePath(`/admin/pacientes/${result.patientId}`);
    return { success: true };
}