import { ReactNode } from "react";
import { Role } from "./admins";
import { Appointment } from "./pacientes";
import { ToothStatus, CustomTooth } from "./odontograma";

export interface NavItemProps {
    href: string;
    icon: ReactNode;
    children: ReactNode;
    active?: boolean;
}

export interface ViewPermissionsProps {
    roleName: string;
    permissions: Role["permissions"];
}

// --- calendar-nav-bar ---
export interface CalendarNavBarProps {
    monthName: string;
    isCurrentMonth: boolean;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onGoToday: () => void;
    actionButton?: ReactNode;
}

// --- stats-panel ---
export interface StatsPanelProps {
    total: number;
    confirmed: number;
    pending: number;
}

// --- table-skeleton ---
export interface TableSkeletonProps {
    rowsCount?: number;
    colsCount?: number;
    hasHeaderButton?: boolean;
    buttonWidthClass?: string;
}

// --- sidebar-quick-schedule ---
export interface PatientFound {
    id: string;
    name: string;
    cpf: string;
    phone: string;
}

// --- agendamentos-create-modal ---
export interface AgendamentoCreateModalProps {
    patientId: string;
    onCreated: (appointment: Appointment) => void;
}

// --- tooth-diagnosis-modal ---
export interface ToothDiagnosisModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTooth: number | null;
    selectedCustomToothId: string | null;
    customTeeth: CustomTooth[];
    currentSelectedStatus: ToothStatus;
    currentSelectedNotes: string;
    customDescription: string;
    quickNotes: string[];
    onCustomDescriptionUpdate: (description: string) => void;
    onToothStatusUpdate: (status: ToothStatus) => void;
    onToothNoteUpdate: (notes: string) => void;
    onConfirm: () => void;
}

export interface PatientAppointmentsSectionProps {
    patientId: string;
    initialAppointments: Appointment[];
}

export interface SearchInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    itemName?: string;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export interface LoadMoreButtonProps {
    visibleCount: number;
    totalCount: number;
    onLoadMore: () => void;
    itemName?: string;
}

export interface ProcedureSelectProps {
    value: string;
    onChange: (val: string) => void;
    customValue?: string;
    onCustomChange?: (val: string) => void;
}

export interface TreatmentOption {
    name: string;
    valuePrivate?: number;
    valuePlan?: number;
}



