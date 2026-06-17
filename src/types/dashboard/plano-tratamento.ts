export interface Treatment {
    id: string;
    name: string;
    category: string;
    valuePrivate: number;
    valuePlan: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTreatmentInput {
    name: string;
    category: string;
    valuePrivate: number;
    valuePlan: number;
    active?: boolean;
}

export interface UpdateTreatmentInput {
    name?: string;
    category?: string;
    valuePrivate?: number;
    valuePlan?: number;
    active?: boolean;
}

export interface TreatmentsResponse {
    treatments: Treatment[];
    categoryCounts: Record<string, number>;
}
