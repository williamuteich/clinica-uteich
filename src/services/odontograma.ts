"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { IOdontogram } from "@/src/types/dashboard/odontograma";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

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
