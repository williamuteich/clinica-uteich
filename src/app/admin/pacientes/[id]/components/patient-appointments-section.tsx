"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, Loader2, Edit3, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Appointment, UpdateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AgendamentoCreateModal from "../nav-links/agendamentos/agendamentos-create-modal";
import { updateAgendamento } from "@/src/services/agendamento";
import { PatientAppointmentsSectionProps } from "@/src/types/dashboard/components";

const statusThemes: Record<Appointment["status"], { bg: string; text: string; border: string; dot: string }> = {
    PENDING: {
        bg: "bg-amber-50/50",
        text: "text-amber-700",
        border: "border-amber-100",
        dot: "bg-amber-500",
    },
    CONFIRMED: {
        bg: "bg-emerald-50/50",
        text: "text-emerald-700",
        border: "border-emerald-100",
        dot: "bg-emerald-500",
    },
    CANCELLED: {
        bg: "bg-rose-50/50",
        text: "text-rose-700",
        border: "border-rose-100",
        dot: "bg-rose-500",
    },
    COMPLETED: {
        bg: "bg-slate-50/60",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-500",
    },
};

const statusLabel: Record<Appointment["status"], string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Realizado",
};

export function PatientAppointmentsSection({ patientId, initialAppointments }: PatientAppointmentsSectionProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [editScheduledAt, setEditScheduledAt] = useState("");
    const [editServiceType, setEditServiceType] = useState("");
    const [editEstimatedValue, setEditEstimatedValue] = useState("");
    const [editStatus, setEditStatus] = useState<Appointment["status"]>("PENDING");

    const sortedAppointments = useMemo(
        () => [...appointments].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
        [appointments]
    );

    const toDateTimeLocalValue = (isoDate: string) => {
        const date = new Date(isoDate);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handleStartEdit = (appointment: Appointment) => {
        setEditingId(appointment.id);
        setEditScheduledAt(toDateTimeLocalValue(appointment.scheduledAt));
        setEditServiceType(appointment.serviceType);
        setEditEstimatedValue(String(appointment.estimatedValue));
        setEditStatus(appointment.status);
    };

    const handleSaveEdit = (id: string) => {
        if (!editScheduledAt || !editServiceType || editEstimatedValue === "") {
            toast.error("Preencha todos os campos para editar.");
            return;
        }

        const payload: UpdateAgendamentoInput = {
            scheduledAt: editScheduledAt,
            serviceType: editServiceType,
            estimatedValue: Number(editEstimatedValue),
            status: editStatus,
        };

        startTransition(async () => {
            const res = await updateAgendamento(id, payload);
            if (!res.success || !res.data) {
                toast.error(res.error || "Erro ao atualizar agendamento.");
                return;
            }

            setAppointments((prev) => prev.map((item) => (item.id === id ? (res.data as Appointment) : item)));
            setEditingId(null);
            toast.success("Agendamento atualizado!");
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-slate-500" />
                    Histórico de Consultas
                </h3>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 shadow-sm transition-all"
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Novo
                        </Button>
                    </DialogTrigger>
                    <AgendamentoCreateModal
                        patientId={patientId}
                        onCreated={(appointment) => {
                            setAppointments((prev) => [appointment, ...prev]);
                        }}
                    />
                </Dialog>
            </div>

            {sortedAppointments.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-semibold">
                        Nenhuma consulta agendada para este paciente.
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    {sortedAppointments.map((appt) => {
                        const theme = statusThemes[appt.status] || statusThemes.PENDING;
                        const isEditing = editingId === appt.id;

                        return (
                            <div
                                key={appt.id}
                                className={cn(
                                    "p-3.5 rounded-xl border transition-all flex flex-col gap-3",
                                    theme.bg,
                                    theme.border
                                )}
                            >
                                {!isEditing ? (
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={cn(
                                                        "font-bold rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider",
                                                        appt.status === "CONFIRMED" && "bg-emerald-100 text-emerald-800 border-emerald-250",
                                                        appt.status === "PENDING" && "bg-amber-100 text-amber-800 border-amber-250",
                                                        appt.status === "CANCELLED" && "bg-rose-100 text-rose-850 border-rose-200",
                                                        appt.status === "COMPLETED" && "bg-slate-100 text-slate-800 border-slate-350"
                                                    )}
                                                >
                                                    {statusLabel[appt.status]}
                                                </Badge>
                                                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                    <CircleDollarSign className="h-3 w-3 text-slate-400" />
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(appt.estimatedValue)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 truncate">
                                                    {appt.serviceType}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {new Date(appt.scheduledAt).toLocaleDateString("pt-BR")} às{" "}
                                                    {new Date(appt.scheduledAt).toLocaleTimeString("pt-BR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleStartEdit(appt)}
                                            className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                            title="Editar Agendamento"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 bg-white/60 p-3 rounded-lg border border-slate-200/50">
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Serviço</label>
                                                <input
                                                    type="text"
                                                    value={editServiceType}
                                                    onChange={(e) => setEditServiceType(e.target.value)}
                                                    className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Data/Hora</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={editScheduledAt}
                                                        onChange={(e) => setEditScheduledAt(e.target.value)}
                                                        className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Valor (R$)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editEstimatedValue}
                                                        onChange={(e) => setEditEstimatedValue(e.target.value)}
                                                        className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Status</label>
                                                <select
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value as Appointment["status"])}
                                                    className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-blue-500"
                                                >
                                                    <option value="PENDING">Pendente</option>
                                                    <option value="CONFIRMED">Confirmado</option>
                                                    <option value="CANCELLED">Cancelado</option>
                                                    <option value="COMPLETED">Realizado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1">
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                onClick={() => setEditingId(null)}
                                                disabled={isPending}
                                                className="h-7 text-[10px] font-bold rounded-lg border-slate-200"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="xs"
                                                onClick={() => handleSaveEdit(appt.id)}
                                                disabled={isPending}
                                                className="h-7 text-[10px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
