"use server";
import { Role, AdminsResponse, AdminFilters } from "@/src/types/dashboard/admins";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getUsuariosInit(filters: AdminFilters = { page: 1, limit: 20 }): Promise<{ admins: AdminsResponse; roles: Role[] } | null> {
    const cookie = (await headers()).get("cookie") || "";
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.name) params.set("name", filters.name);

    const res = await fetch(`${API_URL}/api/admin/usuarios/init?${params.toString()}`, {
        headers: { Cookie: cookie }
    });
    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return {
        admins: {
            admins: data.admins ?? [],
            total: data.total ?? 0,
            page: data.page ?? 1,
            limit: data.limit ?? 20,
            totalPages: data.totalPages ?? 0,
        },
        roles: data.roles ?? [],
    };
}

export async function getAdmins(filters: AdminFilters = { page: 1, limit: 20 }): Promise<AdminsResponse | null> {
    const cookie = (await headers()).get("cookie") || "";
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.name) params.set("name", filters.name);

    const res = await fetch(`${API_URL}/api/admin/usuarios?${params.toString()}`, { headers: { Cookie: cookie } });
    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to fetch admins");
    return await res.json();
}


export async function getRoles(): Promise<Role[] | null> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/roles`, { headers: { Cookie: cookie } });
    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to fetch roles");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function createAdmin(data: { name: string; email: string; roleId: string }): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/usuarios`, {
        method: "POST",
        headers: {
            "Cookie": cookie,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (res.status === 403) return { success: false, error: "Sem permissão" };
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao criar administrador" };

    revalidatePath("/admin/usuarios");
    return { success: true };
}

export async function updateAdmin(id: string, data: { name: string; email: string; roleId: string; active: boolean }): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
        method: "PUT",
        headers: {
            "Cookie": cookie,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (res.status === 403) return { success: false, error: "Sem permissão" };
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar administrador" };

    revalidatePath("/admin/usuarios");
    return { success: true };
}

export async function deleteAdmin(id: string): Promise<{ success: boolean; error?: string }> {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie }
    });

    if (res.status === 403) return { success: false, error: "Sem permissão" };
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || "Erro ao excluir administrador" };

    revalidatePath("/admin/usuarios");
    return { success: true };
}
