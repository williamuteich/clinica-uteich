"use server";
import { Role } from "@/src/types/dashboard/admins";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getRoles(): Promise<Role[] | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/roles`, {
        headers: { Cookie: cookie }
    });
    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to fetch roles");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function createRole(data: { name: string; description: string; permissions: { resource: string; action: string }[] }): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/roles`, {
        method: "POST",
        headers: {
            "Cookie": cookie,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (res.status === 403) return { success: false, error: "Sem permissão" };
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar cargo" };

    revalidatePath("/admin/cargos");
    return { success: true };
}

export async function updateRole(id: string, data: { name: string; description: string; permissions: { resource: string; action: string }[] }): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/roles/${id}`, {
        method: "PUT",
        headers: {
            "Cookie": cookie,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (res.status === 403) return { success: false, error: "Sem permissão" };
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar cargo" };

    revalidatePath("/admin/cargos");
    return { success: true };
}

export async function deleteRole(id: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie }
    });

    if (res.status === 403) return { success: false, error: "Sem permissão" };
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir cargo" };

    revalidatePath("/admin/cargos");
    return { success: true };
}
