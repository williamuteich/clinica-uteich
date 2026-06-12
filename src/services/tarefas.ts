"use server";

import { headers } from "next/headers";
import { PatientTask, CreateTaskInput, UpdateTaskInput, PatientTasksResponse } from "@/src/types/dashboard/tarefa";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getTarefasPaciente(patientId: string): Promise<PatientTasksResponse | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/tarefas`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function createTarefa(data: CreateTaskInput): Promise<{ success: boolean; data?: PatientTask; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${data.patientId}/tarefas`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar tarefa" };
    return { success: true, data: result };
}

export async function updateTarefa(patientId: string, taskId: string, data: UpdateTaskInput): Promise<{ success: boolean; data?: PatientTask; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/tarefas`, {
        method: "PUT",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, ...data }),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar tarefa" };
    return { success: true, data: result };
}

export async function deleteTarefa(patientId: string, taskId: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/pacientes/${patientId}/tarefas?taskId=${taskId}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao deletar tarefa" };
    return { success: true };
}
