export interface Admin {
    id: string;
    email: string;
    name: string | null;
    active: boolean;
    createdAt: string;
    image: string | null;
    role: {
        id: string;
        name: string;
    } | null;
    lastLogin: string | null;
}

export interface PermissionToRole {
    permission: {
        resource: string;
        action: string;
    };
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: PermissionToRole[];
}

export interface AdminsResponse {
    admins: Admin[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminFilters {
    page?: number;
    limit?: number;
    name?: string;
}