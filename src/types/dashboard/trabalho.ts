export type Trabalho = {
    id: string;
    nomePaciente: string;
    cpfPaciente?: string | null;
    pacienteId?: string | null;
    laboratorio: string;
    nomeTrabalho: string;
    descricao?: string | null;
    status: "PENDENTE" | "CONCLUIDO";
    dataEnvio: string;
    dentesEnvolvidos?: string | null;
    valor?: number | null;
    observacoes?: string | null;
};

export type TrabalhosResponse = {
    trabalhos: Trabalho[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
};

export type DashboardStats = {
    pendentes: number;
    concluidos: number;
};

export type PatientMatch = {
    id: string;
    name: string;
    cpf: string;
};
