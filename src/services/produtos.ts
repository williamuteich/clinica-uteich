"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getProducts(params?: { page?: number; limit?: number; query?: string }) {
    const cookie = (await headers()).get("cookie") || "";
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.query) qs.set("query", params.query);

    const res = await fetch(`${API_URL}/api/admin/produtos?${qs}`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}

export async function createProducts(items: any[]) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/produtos`, {
        method: "POST",
        headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
    });
    const data = await res.json();
    if (res.ok) {
        revalidatePath("/admin/produtos");
    }
    return res.ok ? { success: true, data } : { success: false, error: data.error };
}

export async function updateProduct(id: string, body: any) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/produtos/${id}`, {
        method: "PUT",
        headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
        revalidatePath("/admin/produtos");
    }
    return res.ok ? { success: true, data } : { success: false, error: data.error };
}

export async function deleteProduct(id: string) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/produtos/${id}`, {
        method: "DELETE",
        headers: { Cookie: cookie },
    });
    const data = await res.json();
    if (res.ok) {
        revalidatePath("/admin/produtos");
    }
    return res.ok ? { success: true } : { success: false, error: data.error };
}

export async function adjustStock(id: string, delta: number, notes?: string) {
    const cookie = (await headers()).get("cookie") || "";
    const res = await fetch(`${API_URL}/api/admin/produtos/${id}/estoque`, {
        method: "PUT",
        headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ delta, notes }),
    });
    const data = await res.json();
    if (res.ok) {
        revalidatePath("/admin/produtos");
    }
    return res.ok ? { success: true, data } : { success: false, error: data.error };
}

export async function getMovements(params?: { page?: number; limit?: number; query?: string }) {
    const cookie = (await headers()).get("cookie") || "";
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.query) qs.set("query", params.query);

    const res = await fetch(`${API_URL}/api/admin/produtos/movimentacoes?${qs}`, {
        headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    return res.json();
}
