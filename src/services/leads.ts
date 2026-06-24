"use server";

import { Lead, LeadStats } from "../types/dashboard/leads";

export async function getLeads(filters: { page?: number; limit?: number; search?: string; status?: string } = { page: 1, limit: 20 }): Promise<{ leads: Lead[]; stats: LeadStats; total: number; page: number; limit: number; totalPages: number } | null> {
    return {
        leads: [],
        stats: {
            total: 0,
            interested: 0,
            converted: 0,
            conversionRate: 0
        },
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: 0
    };
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
}
