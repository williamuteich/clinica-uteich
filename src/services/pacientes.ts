"use server";
import { AgendamentoFilters, AgendamentosResponse, Appointment, CreateAgendamentoInput, HistoricoPatient, Paciente, PacienteFilters, PacientesResponse, UpdateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { IAnamnese } from "@/src/types/dashboard/anamnese";
import { IOdontogram } from "@/src/types/dashboard/odontograma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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
        { headers: { Cookie: cookie } }
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
    return { success: true };
}

// AGENDAMENTOS
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

// HISTÓRICO DO PACIENTE
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

// ANAMNESE DO PACIENTE
export async function getAnamnesePaciente(patientId: string): Promise<IAnamnese | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/anamnese`, {
        headers: { Cookie: cookie }
    });
    if (!res.ok) return null;
    return res.json();
}

export async function saveAnamnesePaciente(patientId: string, data: any): Promise<{ success: boolean; data?: IAnamnese; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/anamnese`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao salvar anamnese" };
    revalidatePath(`/admin/pacientes/${patientId}`);
    return { success: true, data: result };
}

// ODONTOGRAMA DO PACIENTE
export async function getOdontogramaPaciente(patientId: string): Promise<IOdontogram | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/odontograma`, {
        headers: { Cookie: cookie }
    });
    if (!res.ok) return null;
    return res.json();
}

export async function saveOdontogramaPaciente(patientId: string, data: any): Promise<{ success: boolean; data?: IOdontogram; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const isUpdate = !!data.id;
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/odontograma`, {
        method: isUpdate ? "PUT" : "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao salvar odontograma" };
    revalidatePath(`/admin/pacientes/${patientId}`);
    return { success: true, data: result };
}
