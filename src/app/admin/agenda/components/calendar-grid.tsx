"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    UserCheck,
    UserX,
    Loader2,
    ChevronDown,
    Pencil,
    Check,
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Info,

} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

export interface Appointment {
    id: string | number;
    patientName: string;
    date: string;
    time: string;
    procedure: string;
    estimatedValue: number;
    status: "Confirmado" | "Pendente" | "Cancelado";
    isNew?: boolean;
    isGuest?: boolean;
    patientId?: string;
    description?: string;
}

interface CalendarGridProps {
    appointments: Appointment[];
    viewDate: Date;
    setViewDate: (date: Date) => void;
    onStatusChange: (id: string | number, status: "Confirmado" | "Cancelado") => void;
    onUpdate: (id: string | number, updatedFields: Partial<Appointment>) => void;
    onAdd: (apt: Omit<Appointment, "id">) => void;
}

interface PatientFound {
    id: string;
    name: string;
    cpf: string;
    phone: string;
}

const PROCEDURES = [
    "Consulta de Avaliação",
    "Limpeza e Profilaxia",
    "Clareamento Dental",
    "Aparelho Ortodôntico",
    "Implante Dentário",
    "Prótese Dentária",
    "Extração",
    "Restauração",
    "Tratamento de Canal",
    "Cirurgia Oral",
    "Periodontia",
    "Outro",
];

const STATUS_THEMES = {
    Confirmado: {
        bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-250 text-emerald-800",
        badge: "bg-emerald-500 text-white",
        dot: "bg-emerald-500",
        pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    Pendente: {
        bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-250 text-amber-900",
        badge: "bg-amber-500 text-white",
        dot: "bg-amber-500",
        pill: "bg-amber-100 text-amber-800 border-amber-250",
    },
    Cancelado: {
        bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-250 text-rose-800 opacity-60",
        badge: "bg-rose-500 text-white",
        dot: "bg-rose-500",
        pill: "bg-rose-100 text-rose-800 border-rose-200",
    },
};

function formatCPF(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function extractPhone(desc?: string | null) {
    if (!desc) return null;
    const match = desc.match(/(?:Telefone\/WhatsApp:\s*|WhatsApp:\s*|Telefone:\s*)([^\n]+)/i);
    if (match && match[1]) {
        return match[1].trim();
    }
    const numbersMatch = desc.match(/(?:\(?\d{2}\)?\s*?\d{4,5}-?\d{4})/);
    if (numbersMatch) {
        return numbersMatch[0].trim();
    }
    return null;
}

function cleanPhoneForWhatsapp(phoneStr: string) {
    const clean = phoneStr.replace(/\D/g, "");
    if (clean.length === 11 || clean.length === 10) {
        return "55" + clean;
    }
    return clean;
}

export default function CalendarGrid({ appointments, viewDate, setViewDate, onStatusChange, onUpdate, onAdd }: CalendarGridProps) {
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [mode, setMode] = useState<"registered" | "guest">("registered");
    const [cpfInput, setCpfInput] = useState("");
    const [cpfSearching, setCpfSearching] = useState(false);
    const [patientFound, setPatientFound] = useState<PatientFound | null>(null);
    const [cpfError, setCpfError] = useState("");
    const [guestName, setGuestName] = useState("");
    const [procedure, setProcedure] = useState("");
    const [customProcedure, setCustomProcedure] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [time, setTime] = useState("09:00");
    const [submitting, setSubmitting] = useState(false);
    const [procedureOpen, setProcedureOpen] = useState(false);
    const procedureRef = useRef<HTMLDivElement>(null);

    const [editProcedure, setEditProcedure] = useState("");
    const [editCustomProcedure, setEditCustomProcedure] = useState("");
    const [editEstimatedValue, setEditEstimatedValue] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editStatus, setEditStatus] = useState<"Confirmado" | "Pendente" | "Cancelado">("Pendente");
    const [editProcedureOpen, setEditProcedureOpen] = useState(false);
    const editProcedureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (procedureRef.current && !procedureRef.current.contains(e.target as Node)) {
                setProcedureOpen(false);
            }
            if (editProcedureRef.current && !editProcedureRef.current.contains(e.target as Node)) {
                setEditProcedureOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 6: Sat
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = prevMonthLastDay - i;
        const prevMonthDate = new Date(year, month - 1, d);
        const y = prevMonthDate.getFullYear();
        const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
        const day = String(prevMonthDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        cells.push({
            dateStr,
            dayNum: d,
            isCurrentMonth: false,
            isToday: dateStr === todayStr,
        });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
        const currentMonthDate = new Date(year, month, d);
        const y = currentMonthDate.getFullYear();
        const m = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentMonthDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        cells.push({
            dateStr,
            dayNum: d,
            isCurrentMonth: true,
            isToday: dateStr === todayStr,
        });
    }

    const remainingCells = 42 - cells.length;
    for (let d = 1; d <= remainingCells; d++) {
        const nextMonthDate = new Date(year, month + 1, d);
        const y = nextMonthDate.getFullYear();
        const m = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextMonthDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        cells.push({
            dateStr,
            dayNum: d,
            isCurrentMonth: false,
            isToday: dateStr === todayStr,
        });
    }

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToToday = () => setViewDate(new Date());

    const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(viewDate);

    const handleCPFSearch = async () => {
        const raw = cpfInput.replace(/\D/g, "");
        if (raw.length !== 11) {
            setCpfError("CPF deve ter 11 dígitos");
            return;
        }
        setCpfSearching(true);
        setCpfError("");
        setPatientFound(null);
        try {
            let res = await fetch(`/api/admin/pacientes?cpf=${raw}&limit=1`);
            let data = await res.json();

            if (!data.pacientes || data.pacientes.length === 0) {
                const formatted = formatCPF(raw);
                res = await fetch(`/api/admin/pacientes?cpf=${encodeURIComponent(formatted)}&limit=1`);
                data = await res.json();
            }

            if (data.pacientes && data.pacientes.length > 0) {
                const p = data.pacientes[0];
                setPatientFound({ id: p.id, name: p.name, cpf: p.cpf, phone: p.phone });
            } else {
                setCpfError("Paciente não encontrado. Use 'Sem Cadastro' para este agendamento.");
            }
        } catch (err) {
            setCpfError("Erro de conexão. Tente novamente.");
        } finally {
            setCpfSearching(false);
        }
    };

    const openAddModal = (dateStr: string) => {
        setSelectedDateStr(dateStr);
        setMode("registered");
        setCpfInput("");
        setPatientFound(null);
        setCpfError("");
        setGuestName("");
        setProcedure("");
        setCustomProcedure("");
        setEstimatedValue("");
        setTime("09:00");
        setIsAddOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalProcedure = procedure === "Outro" ? customProcedure : procedure;
        if (!finalProcedure || !selectedDateStr) return;

        const isGuest = mode === "guest";
        const name = isGuest ? guestName : patientFound?.name;
        if (!name) return;
        const parsedEstimatedValue = Number(estimatedValue);
        if (Number.isNaN(parsedEstimatedValue) || parsedEstimatedValue < 0) return;

        setSubmitting(true);
        onAdd({
            patientName: name,
            date: selectedDateStr,
            time,
            procedure: finalProcedure,
            estimatedValue: parsedEstimatedValue,
            status: "Pendente",
            isNew: true,
            isGuest,
            ...(mode === "registered" && patientFound ? { patientId: patientFound.id } : {}),
        } as any);
        setSubmitting(false);
        setIsAddOpen(false);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApt) return;
        const finalProcedure = editProcedure === "Outro" ? editCustomProcedure : editProcedure;
        if (!finalProcedure) return;
        const parsedEditEstimatedValue = Number(editEstimatedValue);
        if (Number.isNaN(parsedEditEstimatedValue) || parsedEditEstimatedValue < 0) return;

        onUpdate(selectedApt.id, {
            procedure: finalProcedure,
            estimatedValue: parsedEditEstimatedValue,
            date: editDate,
            time: editTime,
            status: editStatus,
        });

        setIsEditOpen(false);
    };

    const currentMonthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date + "T00:00:00");
        return aptDate.getFullYear() === year && aptDate.getMonth() === month;
    });

    const stats = {
        total: currentMonthAppointments.length,
        confirmados: currentMonthAppointments.filter(a => a.status === "Confirmado").length,
        pendentes: currentMonthAppointments.filter(a => a.status === "Pendente").length,
        cancelados: currentMonthAppointments.filter(a => a.status === "Cancelado").length,
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <div className="bg-linear-to-br from-white to-blue-50/20 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Mês ({monthName})</p>
                        <p className="text-xl font-black text-slate-800 mt-0.5">{stats.total} Agendados</p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-white to-emerald-50/20 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmados</p>
                        <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.confirmados}</p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-white to-amber-50/20 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aguardando Resposta</p>
                        <p className="text-xl font-black text-amber-700 mt-0.5">{stats.pendentes}</p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-white to-rose-50/20 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-inner">
                        <XCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cancelados</p>
                        <p className="text-xl font-black text-rose-600 mt-0.5">{stats.cancelados}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 transition-all cursor-pointer"
                        title="Mês Anterior"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer uppercase tracking-wider"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 transition-all cursor-pointer"
                        title="Próximo Mês"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <span className="text-sm md:text-base font-black text-slate-800 uppercase tracking-wide ml-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        {monthName}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openAddModal(new Date().toISOString().split("T")[0])}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-all cursor-pointer uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4" />
                        Agendar Neste Mês
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                <div className="grid grid-cols-7 border-b bg-slate-50/80">
                    {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((day, idx) => (
                        <div
                            key={day}
                            className={cn(
                                "py-3 text-center text-[10px] font-black uppercase tracking-wider border-r border-slate-200/80 last:border-r-0",
                                (idx === 0 || idx === 6) ? "text-slate-400" : "text-slate-500"
                            )}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-150">
                    {cells.map((cell, idx) => {
                        const cellApts = appointments.filter(apt => apt.date === cell.dateStr);

                        return (
                            <div
                                key={`${cell.dateStr}-${idx}`}
                                className={cn(
                                    "min-h-[110px] p-2 flex flex-col justify-between group transition-all duration-200 relative",
                                    cell.isCurrentMonth ? "bg-white" : "bg-slate-50/40 text-slate-400",
                                    cell.isToday && "bg-blue-50/60 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.18)] z-10"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={cn(
                                                "text-xs font-black w-6 h-6 flex items-center justify-center rounded-full transition-all",
                                                cell.isToday
                                                    ? "bg-blue-600 text-white shadow-md font-black ring-2 ring-blue-150"
                                                    : cell.isCurrentMonth
                                                        ? "text-slate-700 group-hover:text-blue-600"
                                                        : "text-slate-350"
                                            )}
                                        >
                                            {cell.dayNum}
                                        </span>
                                        {cell.isToday && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[8px] font-black tracking-wider uppercase shadow-xs animate-pulse">
                                                Hoje
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openAddModal(cell.dateStr);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white flex items-center justify-center text-blue-600 transition-all cursor-pointer shadow-xs border border-blue-100"
                                        title="Novo agendamento para este dia"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>

                                <div className="flex-1 mt-2 space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar pr-0.5">
                                    {cellApts.map(apt => {
                                        const theme = STATUS_THEMES[apt.status] || STATUS_THEMES.Pendente;
                                        return (
                                            <div
                                                key={apt.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedApt(apt);
                                                    setIsDetailsOpen(true);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                className={cn(
                                                    "w-full text-left p-1 rounded-lg border text-[10px] font-bold transition-all truncate flex items-center gap-1 shadow-2xs hover:scale-[1.02]",
                                                    theme.bg
                                                )}
                                            >
                                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", theme.dot)} />
                                                <span className="font-semibold text-slate-700 opacity-90">{apt.time}</span>
                                                <span className="truncate flex-1 font-black tracking-tight">{apt.patientName}</span>
                                                {apt.patientId && !apt.isGuest && (
                                                    <Link
                                                        href={`/admin/pacientes/${apt.patientId}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="ml-1 rounded-md bg-white/70 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
                                                    >
                                                        Prontuário
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {cellApts.length > 0 && (
                                    <div className="mt-1 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                                        <span>{cellApts.length} {cellApts.length === 1 ? 'Consulta' : 'Consultas'}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
                    {selectedApt && (
                        <div className="bg-white">
                            <div className={cn(
                                "px-6 py-6 text-white bg-linear-to-r",
                                selectedApt.status === "Confirmado" && "from-emerald-600 to-emerald-700",
                                selectedApt.status === "Pendente" && "from-amber-500 to-orange-600",
                                selectedApt.status === "Cancelado" && "from-rose-500 to-rose-600"
                            )}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-black text-white">Detalhes do Agendamento</DialogTitle>
                                            <p className="text-xs text-white/90">Gestão clínica e controle</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paciente</span>
                                        <p className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1.5">
                                            {selectedApt.patientName}
                                            {selectedApt.isGuest && (
                                                <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[8px] font-bold rounded">
                                                    Sem Cadastro
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status da Consulta</span>
                                        <div className="mt-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block",
                                                (STATUS_THEMES[selectedApt.status] || STATUS_THEMES.Pendente).pill
                                            )}>
                                                {selectedApt.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procedimento</span>
                                        <p className="text-xs font-bold text-slate-850 mt-1">{selectedApt.procedure}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Estimado</span>
                                        <p className="text-xs font-bold text-slate-850 mt-1">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedApt.estimatedValue || 0)}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data & Horário</span>
                                        <p className="text-xs font-bold text-slate-850 mt-1">
                                            {selectedApt.date.split("-").reverse().join("/")} às <span className="text-blue-600 font-black">{selectedApt.time}</span>
                                        </p>
                                    </div>

                                    {selectedApt.description && (
                                        <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observações / Telefone</span>
                                            <p className="text-xs font-medium text-slate-705 mt-1 whitespace-pre-wrap leading-relaxed">
                                                {selectedApt.description}
                                            </p>
                                        </div>
                                    )}

                                    {selectedApt.description && extractPhone(selectedApt.description) && (
                                        <div className="col-span-2">
                                            <a
                                                href={`https://api.whatsapp.com/send/?phone=${cleanPhoneForWhatsapp(extractPhone(selectedApt.description)!)}&text=${encodeURIComponent(
                                                    `Olá ${selectedApt.patientName}, tudo bem? Sou o Dr. Lenon, da Uteich Odontologia. Estou entrando em contato para confirmar seu agendamento de ${selectedApt.procedure} no dia ${selectedApt.date.split("-").reverse().join("/")} às ${selectedApt.time}.`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                                                Conversar no WhatsApp
                                            </a>
                                        </div>
                                    )}

                                    {selectedApt.patientId && !selectedApt.isGuest && (
                                        <div className="col-span-2">
                                            <Link
                                                href={`/admin/pacientes/${selectedApt.patientId}`}
                                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors"
                                            >
                                                Abrir prontuário
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {selectedApt.status === "Pendente" && (
                                    <div className="pt-2 flex gap-2">
                                        <button
                                            onClick={() => {
                                                onStatusChange(selectedApt.id, "Confirmado");
                                                setIsDetailsOpen(false);
                                            }}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                                        >
                                            <Check className="h-4 w-4" />
                                            Confirmar Agendamento
                                        </button>
                                        <button
                                            onClick={() => {
                                                onStatusChange(selectedApt.id, "Cancelado");
                                                setIsDetailsOpen(false);
                                            }}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Cancelar
                                        </button>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsDetailsOpen(false)}
                                        className="h-10 px-4 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                                    >
                                        Fechar
                                    </button>

                                    <button
                                        className="inline-flex items-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                                        onClick={() => {
                                            if (selectedApt) {
                                                setEditProcedure(PROCEDURES.includes(selectedApt.procedure) ? selectedApt.procedure : "Outro");
                                                setEditCustomProcedure(PROCEDURES.includes(selectedApt.procedure) ? "" : selectedApt.procedure);
                                                setEditEstimatedValue(String(selectedApt.estimatedValue ?? 0));
                                                setEditDate(selectedApt.date);
                                                setEditTime(selectedApt.time);
                                                setEditStatus(selectedApt.status);
                                                setIsDetailsOpen(false);
                                                setIsEditOpen(true);
                                            }
                                        }}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Editar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-lg border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-white">Novo Agendamento</DialogTitle>
                                <DialogDescription className="text-xs text-blue-100 font-semibold mt-0.5">
                                    Marcar consulta para {selectedDateStr?.split("-").reverse().join("/")}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                Identificação do Paciente
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setMode("registered"); setPatientFound(null); setCpfError(""); setCpfInput(""); }}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer",
                                        mode === "registered"
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                                    )}
                                >
                                    <UserCheck className="h-4 w-4" />
                                    Paciente Cadastrado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMode("guest"); setPatientFound(null); setCpfError(""); setCpfInput(""); }}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer",
                                        mode === "guest"
                                            ? "border-violet-500 bg-violet-50 text-violet-700"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                                    )}
                                >
                                    <UserX className="h-4 w-4" />
                                    Sem Cadastro
                                </button>
                            </div>
                        </div>

                        {mode === "registered" && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                    CPF do Paciente
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={cpfInput}
                                        onChange={(e) => {
                                            setCpfInput(formatCPF(e.target.value));
                                            setCpfError("");
                                            setPatientFound(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleCPFSearch();
                                            }
                                        }}
                                        placeholder="000.000.000-00"
                                        className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCPFSearch}
                                        disabled={cpfSearching}
                                        className="h-10 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                                    >
                                        {cpfSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                                        Buscar
                                    </button>
                                </div>

                                {cpfError && (
                                    <p className="mt-1.5 text-xs text-rose-500 font-bold flex items-center gap-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {cpfError}
                                    </p>
                                )}

                                {patientFound && (
                                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white">
                                                <UserCheck className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Paciente Confirmado</span>
                                        </div>
                                        <p className="text-xs font-black text-slate-800">{patientFound.name}</p>
                                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">CPF: {patientFound.cpf}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === "guest" && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                    Nome Completo <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Nome completo do paciente"
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-medium"
                                    required
                                />
                                <p className="mt-1.5 text-[10px] text-violet-600 font-bold flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Agendamento rápido sem necessidade de cadastro prévio.
                                </p>
                            </div>
                        )}

                        <div ref={procedureRef}>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                Procedimento Clínico <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProcedureOpen(o => !o)}
                                    className={cn(
                                        "w-full h-10 px-3 flex items-center justify-between text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer",
                                        procedure ? "text-slate-800 border-slate-350" : "text-slate-400 border-slate-200"
                                    )}
                                >
                                    <span className="truncate">{procedure || "Selecione o procedimento..."}</span>
                                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", procedureOpen && "rotate-180")} />
                                </button>
                                {procedureOpen && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-250 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                        {PROCEDURES.map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => { setProcedure(p); setProcedureOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                    procedure === p ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {procedure === "Outro" && (
                                <input
                                    type="text"
                                    value={customProcedure}
                                    onChange={(e) => setCustomProcedure(e.target.value)}
                                    placeholder="Qual é o procedimento?"
                                    className="mt-2 w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                Valor Estimado <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={estimatedValue}
                                onChange={(e) => setEstimatedValue(e.target.value)}
                                placeholder="Ex: 250"
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Data</label>
                                <input
                                    type="date"
                                    value={selectedDateStr || ""}
                                    onChange={(e) => setSelectedDateStr(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Horário</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="flex-1 h-10 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !procedure ||
                                    (mode === "registered" && !patientFound) ||
                                    (mode === "guest" && !guestName.trim())
                                }
                                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 uppercase tracking-wider"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Confirmar Agendamento
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-lg border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Pencil className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-white">Editar Agendamento</DialogTitle>
                                <DialogDescription className="text-xs text-blue-100 font-semibold mt-0.5">
                                    Alterar dados da consulta de {selectedApt?.patientName}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                Status do Agendamento
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Pendente", "Confirmado", "Cancelado"].map((statusOption) => (
                                    <button
                                        key={statusOption}
                                        type="button"
                                        onClick={() => setEditStatus(statusOption as any)}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border-2 text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider",
                                            editStatus === statusOption
                                                ? statusOption === "Confirmado"
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                    : statusOption === "Cancelado"
                                                        ? "border-rose-500 bg-rose-50 text-rose-700"
                                                        : "border-amber-500 bg-amber-50 text-amber-705"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            statusOption === "Confirmado" && "bg-emerald-500",
                                            statusOption === "Cancelado" && "bg-rose-500",
                                            statusOption === "Pendente" && "bg-amber-500"
                                        )} />
                                        {statusOption}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div ref={editProcedureRef}>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                Procedimento Clínico <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setEditProcedureOpen(o => !o)}
                                    className={cn(
                                        "w-full h-10 px-3 flex items-center justify-between text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer",
                                        editProcedure ? "text-slate-800 border-slate-350" : "text-slate-400 border-slate-200"
                                    )}
                                >
                                    <span className="truncate">{editProcedure || "Selecione o procedimento..."}</span>
                                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", editProcedureOpen && "rotate-180")} />
                                </button>
                                {editProcedureOpen && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-250 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                        {PROCEDURES.map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => { setEditProcedure(p); setEditProcedureOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                    editProcedure === p ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {editProcedure === "Outro" && (
                                <input
                                    type="text"
                                    value={editCustomProcedure}
                                    onChange={(e) => setEditCustomProcedure(e.target.value)}
                                    placeholder="Qual é o procedimento?"
                                    className="mt-2 w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                Valor Estimado <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editEstimatedValue}
                                onChange={(e) => setEditEstimatedValue(e.target.value)}
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Data</label>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Horário</label>
                                <input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="flex-1 h-10 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!editProcedure}
                                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                            >
                                <Check className="h-4 w-4" />
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
