export interface AgendaStatsCardsProps {
    monthName: string;
    stats: {
        total: number;
        confirmados: number;
        pendentes: number;
        cancelados: number;
    };
}

export interface Appointment {
    id: string | number;
    patientName: string;
    date: string;
    time: string;
    procedure: string;
    estimatedValue: number;
    status: "Confirmado" | "Pendente" | "Cancelado" | "Finalizado";
    isNew?: boolean;
    isGuest?: boolean;
    patientId?: string;
    description?: string;
    guestPhone?: string | null;
    phone?: string | null;
}

export interface CalendarGridProps {
    appointments: Appointment[];
    viewDate: Date;
    setViewDate: (date: Date) => void;
    onStatusChange: (id: string | number, status: "Confirmado" | "Cancelado" | "Finalizado" | "Pendente") => void;
    onUpdate: (id: string | number, updatedFields: Partial<Appointment>) => void;
    onAdd: (apt: Omit<Appointment, "id">) => void;
}

export interface PatientFound {
    id: string;
    name: string;
    cpf: string;
    phone: string;
}

export interface AddAppointmentDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    selectedDateStr: string | null;
    onDateChange: (date: string) => void;
    onAdd: (apt: Omit<Appointment, "id">) => void;
    appointments?: Appointment[];
}