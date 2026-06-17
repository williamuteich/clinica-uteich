"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { CreateTreatmentInput, UpdateTreatmentInput } from "@/src/types/dashboard/plano-tratamento";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getTreatments(params?: { category?: string; query?: string }) {
    const cookie = (await headers()).get("cookie") || "";
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.query) qs.set("query", params.query);

    const res = await fetch(`${API_URL}/api/admin/planos-tratamento?${qs}`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function createTreatment(data: CreateTreatmentInput) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/planos-tratamento`, {
        method: "POST",
        headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
        revalidatePath("/admin/planos-tratamento");
    }
    return res.ok ? { success: true, data: result } : { success: false, error: result.error };
}

export async function updateTreatment(id: string, data: UpdateTreatmentInput) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/planos-tratamento/${id}`, {
        method: "PUT",
        headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
        revalidatePath("/admin/planos-tratamento");
    }
    return res.ok ? { success: true, data: result } : { success: false, error: result.error };
}

export async function deleteTreatment(id: string) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/planos-tratamento/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const result = await res.json();
    if (res.ok) {
        revalidatePath("/admin/planos-tratamento");
    }
    return res.ok ? { success: true } : { success: false, error: result.error };
}
