"use server";
import { Paciente, PacienteFilters, PacientesResponse } from "@/src/types/dashboard/pacientes";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { GeneratedLinkInput } from "@/src/schemas/paciente";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getPacientes(filters: PacienteFilters = { page: 1, limit: 20 }): Promise<PacientesResponse | null> {
    const cookie = (await headers()).get("cookie") || "";
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.name) params.set("name", filters.name);
    if (filters.cpf) params.set("cpf", filters.cpf);

    const query = params.toString();
    const res = await fetch(
        `${API_URL}/api/admin/pacientes${query ? `?${query}` : ""}`,
        {
            headers: { Cookie: cookie },
            next: { tags: ["pacientes-list"] }
        }
    );

    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Erro ao buscar pacientes");
    return res.json();
}

export async function getPaciente(id: string): Promise<Paciente | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${id}`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function createPaciente(data: Omit<Paciente, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar paciente" };
    revalidatePath("/admin/pacientes");
    revalidateTag("pacientes-list", "max");
    return { success: true };
}

export async function updatePaciente(id: string, data: Partial<Paciente>): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${id}`, {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar paciente" };
    revalidatePath("/admin/pacientes");
    revalidatePath(`/admin/pacientes/${id}`);
    revalidateTag("pacientes-list", "max");
    return { success: true };
}

export async function deletePaciente(id: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir paciente" };
    revalidatePath("/admin/pacientes");
    revalidateTag("pacientes-list", "max");
    return { success: true };
}

export async function createGeneratedLink(data: GeneratedLinkInput): Promise<{ success: boolean; data?: any; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/link`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar link" };
    return { success: true, data: result.generatedLink };
}


