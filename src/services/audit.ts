"use server";
import { headers } from "next/headers";
import { AuditFilters, AuditLogsResponse } from "../types/dashboard/audit";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getAuditLogs(
    filters: AuditFilters = {}
): Promise<AuditLogsResponse | null> {
    const cookie = (await headers()).get("cookie") || "";

    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.resource) params.set("resource", filters.resource);
    if (filters.action) params.set("action", filters.action);
    if (filters.userName) params.set("userName", filters.userName);
    if (filters.administratorId)
        params.set("administratorId", String(filters.administratorId));

    const query = params.toString();
    const res = await fetch(
        `${API_URL}/api/admin/auditoria${query ? `?${query}` : ""}`,
        { cache: 'no-store', headers: { Cookie: cookie } }
    );

    if (res.status === 403 || res.status === 401) return null;
    if (!res.ok) throw new Error("Erro ao buscar logs de auditoria");

    return res.json();
}
