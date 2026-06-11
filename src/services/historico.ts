"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { HistoricoPatient } from "../types/dashboard/pacientes";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getHistoricoPaciente(id: string): Promise<HistoricoPatient[] | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${id}/historico`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function createHistoricoPaciente(patientId: string, description: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/historico`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar histórico" };
    revalidatePath(`/admin/pacientes/${patientId}`);
    return { success: true, data: result };
}

export async function updateHistoricoPaciente(patientId: string, historyId: string, description: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/historico`, {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ historyId, description }),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar histórico" };
    revalidatePath(`/admin/pacientes/${patientId}`);
    return { success: true };
}

export async function deleteHistoricoPaciente(patientId: string, historyId: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/historico?historyId=${historyId}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir histórico" };
    revalidatePath(`/admin/pacientes/${patientId}`);
    return { success: true };
}