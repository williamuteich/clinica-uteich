"use server";

import { IAnamnese } from "@/src/types/dashboard/anamnese";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

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