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
    onAddThisMonth: () => void;
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
