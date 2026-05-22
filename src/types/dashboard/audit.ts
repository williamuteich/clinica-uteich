export interface AuditLog {
    id: number;
    action: "CREATE" | "UPDATE" | "DELETE";
    resource: string | null;
    resourceId: string | null;
    resourceName: string | null;
    url: string | null;
    createdAt: string;
    administrator: {
        id: number;
        name: string | null;
        email: string;
        role: {
            name: string;
        } | null;
    };
}

export interface AuditLogsResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
}

export interface AuditFilters {
    page?: number;
    limit?: number;
    resource?: string;
    action?: string;
    userName?: string;
    administratorId?: number;
}