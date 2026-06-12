export type ProtheticWork = {
    id: string;
    patientName: string;
    patientCpf?: string | null;
    patientId?: string | null;
    laboratory: string;
    workName: string;
    description?: string | null;
    status: "PENDING" | "DONE";
    sentAt: string;
    teethInvolved?: string | null;
    value?: number | null;
    notes?: string | null;
};

export type ProtheticWorksResponse = {
    protheticWorks: ProtheticWork[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
};

export type DashboardStats = {
    pending: number;
    done: number;
};

export type PatientMatch = {
    id: string;
    name: string;
    cpf: string;
};
