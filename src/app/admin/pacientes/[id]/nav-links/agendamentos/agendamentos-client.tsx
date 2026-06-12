"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, Loader2, ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Appointment, UpdateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AgendamentoCreateModal from "./agendamentos-create-modal";
import { updateAgendamento } from "@/src/services/agendamento";

const statusLabel: Record<Appointment["status"], string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Realizado",
};

export default function AgendamentosClient({ patientId, initialAppointments }: { patientId: string; initialAppointments: Appointment[] }) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [newlyCreatedIds, setNewlyCreatedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [editScheduledAt, setEditScheduledAt] = useState("");
    const [editServiceType, setEditServiceType] = useState("");
    const [editEstimatedValue, setEditEstimatedValue] = useState("");
    const [editStatus, setEditStatus] = useState<Appointment["status"]>("PENDING");

    const sortedAppointments = useMemo(
        () => [...appointments].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
        [appointments]
    );

    const summary = useMemo(() => {
        const total = sortedAppointments.length;
        const confirmed = sortedAppointments.filter((item) => item.status === "CONFIRMED").length;
        const pending = sortedAppointments.filter((item) => item.status === "PENDING").length;
        const totalValue = sortedAppointments.reduce((sum, item) => sum + (Number(item.estimatedValue) || 0), 0);

        return { total, confirmed, pending, totalValue };
    }, [sortedAppointments]);

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
            toast.error("Preencha data/hora, tipo de serviço e valor estimado para editar.");
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

            setAppointments((prev) => prev.map((item) => (item.id === id ? res.data as Appointment : item)));
            setEditingId(null);
            toast.success("Agendamento atualizado com sucesso!");
        });
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-6 text-white shadow-lg">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.55),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.35),transparent_32%)]" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">
                            <Calendar className="h-3.5 w-3.5" />
                            Agenda do paciente
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Agendamentos do Paciente
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-slate-300">
                                Visualize consultas, revise valores e acesse o prontuário com um toque quando o paciente já estiver cadastrado.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-10 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-sm"
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Novo Agendamento
                        </Button>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-100">
                            <ListChecks className="h-4 w-4 text-blue-200" />
                            {summary.total} registros
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{summary.total}</p>
                    <p className="text-xs text-slate-500 mt-1">agendamentos registrados</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Confirmados</p>
                    <p className="mt-2 text-2xl font-black text-emerald-800">{summary.confirmed}</p>
                    <p className="text-xs text-emerald-700/80 mt-1">prontos para atendimento</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Pendentes</p>
                    <p className="mt-2 text-2xl font-black text-amber-800">{summary.pending}</p>
                    <p className="text-xs text-amber-700/80 mt-1">aguardando confirmação</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Valor estimado</p>
                    <p className="mt-2 text-2xl font-black text-blue-900">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.totalValue)}
                    </p>
                    <p className="text-xs text-blue-700/80 mt-1">somatório dos agendamentos</p>
                </div>
            </div>

            {sortedAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center text-sm text-slate-500">
                    Nenhum agendamento registrado para este paciente ainda.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedAppointments.map((appt) => (
                        <div
                            key={appt.id}
                            className={cn(
                                "group border rounded-2xl p-5 transition-all duration-300 flex flex-col gap-4 shadow-sm hover:-translate-y-0.5 hover:shadow-lg",
                                newlyCreatedIds.includes(appt.id)
                                    ? "bg-linear-to-br from-blue-50 via-white to-cyan-50 border-blue-200 shadow-blue-100"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            className={cn(
                                                "font-bold rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider",
                                                appt.status === "CONFIRMED" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                                                appt.status === "PENDING" && "bg-blue-50 text-blue-700 border-blue-100",
                                                appt.status === "CANCELLED" && "bg-rose-50 text-rose-700 border-rose-100",
                                                appt.status === "COMPLETED" && "bg-slate-100 text-slate-700 border-slate-200"
                                            )}
                                        >
                                            {statusLabel[appt.status]}
                                        </Badge>
                                        {newlyCreatedIds.includes(appt.id) && <Badge className="font-medium rounded-full bg-blue-600 text-white border-blue-600 px-2.5 py-1 text-[10px] uppercase tracking-wider">Novo</Badge>}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-slate-900 text-base sm:text-lg leading-tight truncate">{appt.serviceType}</h4>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{new Date(appt.scheduledAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                            <span className="text-slate-300">•</span>
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{new Date(appt.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                    </div>
                                </div>
                                {appt.patientId ? (
                                    <Link
                                        href={`/admin/pacientes/${appt.patientId}`}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                                    >
                                        Prontuário
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                ) : (
                                    <Badge className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-700">
                                        Sem cadastro
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Paciente</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800 truncate">{appt.patientName}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-3 py-2 sm:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Valor estimado</p>
                                    <p className="mt-1 text-sm font-black text-slate-900">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(appt.estimatedValue)}
                                    </p>
                                </div>
                            </div>

                            {editingId === appt.id ? (
                                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="datetime-local"
                                        value={editScheduledAt}
                                        onChange={(e) => setEditScheduledAt(e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <input
                                        type="text"
                                        value={editServiceType}
                                        onChange={(e) => setEditServiceType(e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editEstimatedValue}
                                        onChange={(e) => setEditEstimatedValue(e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value as Appointment["status"])}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="PENDING">Pendente</option>
                                        <option value="CONFIRMED">Confirmado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                        <option value="COMPLETED">Realizado</option>
                                    </select>
                                    <div className="md:col-span-2 flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setEditingId(null)} disabled={isPending} className="rounded-xl border-slate-200">
                                            Cancelar
                                        </Button>
                                        <Button onClick={() => handleSaveEdit(appt.id)} disabled={isPending} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Alterações"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-slate-100 pt-4 flex justify-end">
                                    <Button onClick={() => handleStartEdit(appt)} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs">
                                        Editar Agendamento
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <AgendamentoCreateModal
                patientId={patientId}
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCreated={(appointment) => {
                    setAppointments((prev) => [appointment, ...prev]);
                    setNewlyCreatedIds((prev) => [String(appointment.id), ...prev]);
                }}
            />

            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
}
