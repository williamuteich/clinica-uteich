"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { Appointment } from "@/src/types/dashboard/agendamento";
import CalendarGrid from "./calendar-grid";

export default function AgendaContainer() {
    const [viewDate, setViewDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const getLocalDateString = useCallback((dateInput: string | Date) => {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "";
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        return `${yearStr}-${monthStr}-${dayStr}`;
    }, []);

    const getLocalTimeString = useCallback((dateInput: string | Date) => {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "09:00";
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }, []);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();

            const firstDayOfMonth = new Date(year, month, 1);
            const startDayOfWeek = firstDayOfMonth.getDay();
            const prevMonthLastDay = new Date(year, month, 0).getDate();

            const startCellDate = new Date(year, month - 1, prevMonthLastDay - startDayOfWeek + 1);
            startCellDate.setHours(0, 0, 0, 0);

            const totalCells = 42;
            const endCellDate = new Date(startCellDate);
            endCellDate.setDate(startCellDate.getDate() + totalCells);
            endCellDate.setHours(23, 59, 59, 999);

            const startIso = startCellDate.toISOString();
            const endIso = endCellDate.toISOString();

            const res = await fetch(`/api/admin/agenda?startDate=${encodeURIComponent(startIso)}&endDate=${encodeURIComponent(endIso)}&limit=1000`);
            if (!res.ok) throw new Error();
            const data = await res.json();

            if (data.agendamentos) {
                const mapped: Appointment[] = data.agendamentos.map((apt: any) => {
                    let mappedStatus: "Confirmado" | "Pendente" | "Cancelado" | "Finalizado" = "Pendente";
                    if (apt.status === "CONFIRMED") {
                        mappedStatus = "Confirmado";
                    } else if (apt.status === "COMPLETED") {
                        mappedStatus = "Finalizado";
                    } else if (apt.status === "CANCELLED") {
                        mappedStatus = "Cancelado";
                    }

                    return {
                        id: apt.id,
                        patientName: apt.patientName || apt.guestName || "Paciente",
                        date: getLocalDateString(apt.scheduledAt),
                        time: getLocalTimeString(apt.scheduledAt),
                        procedure: apt.serviceType || "Consulta",
                        estimatedValue: Number(apt.estimatedValue || 0),
                        status: mappedStatus,
                        isGuest: !apt.patientId || apt.patientId === "",
                        patientId: apt.patientId || undefined,
                        description: apt.description || undefined,
                        guestPhone: apt.guestPhone || undefined,
                        phone: apt.phone || undefined,
                    };
                });
                setAppointments(mapped);
            }
        } catch (error) {
            console.error("Erro ao carregar agendamentos reais:", error);
        } finally {
            setLoading(false);
        }
    }, [viewDate, getLocalDateString, getLocalTimeString]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusChange = async (id: string | number, newStatus: "Confirmado" | "Cancelado" | "Finalizado" | "Pendente") => {
        try {
            setAppointments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
            );

            const backendStatus =
                newStatus === "Confirmado" ? "CONFIRMED" :
                newStatus === "Cancelado" ? "CANCELLED" :
                newStatus === "Finalizado" ? "COMPLETED" : "PENDING";

            const res = await fetch(`/api/admin/agenda/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: backendStatus }),
            });

            if (!res.ok) throw new Error();
            fetchAppointments();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            fetchAppointments();
        }
    };

    const handleUpdate = async (id: string | number, updatedFields: Partial<Appointment>) => {
        try {
            const scheduledAt = updatedFields.date && updatedFields.time
                ? new Date(`${updatedFields.date}T${updatedFields.time}:00`).toISOString()
                : undefined;

            const body = {
                ...(scheduledAt ? { scheduledAt } : {}),
                ...(updatedFields.procedure ? { serviceType: updatedFields.procedure } : {}),
                ...(typeof updatedFields.estimatedValue === "number" ? { estimatedValue: updatedFields.estimatedValue } : {}),

                ...(updatedFields.status ? {
                    status: updatedFields.status === "Confirmado" ? "CONFIRMED" :
                        updatedFields.status === "Cancelado" ? "CANCELLED" :
                        updatedFields.status === "Finalizado" ? "COMPLETED" : "PENDING"
                } : {}),
                ...(updatedFields.description !== undefined ? { description: updatedFields.description } : {}),
                ...(updatedFields.isGuest && updatedFields.patientName ? { guestName: updatedFields.patientName } : {}),
            };

            const res = await fetch(`/api/admin/agenda/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error();
            fetchAppointments();
        } catch (error) {
            console.error("Erro ao atualizar agendamento:", error);
            alert("Erro ao salvar as alterações do agendamento.");
        }
    };

    const handleAdd = async (apt: Omit<Appointment, "id">) => {
        try {
            const scheduledAt = new Date(`${apt.date}T${apt.time}:00`);
            const isGuest = apt.isGuest;

            const body = {
                ...(isGuest ? { guestName: apt.patientName } : { patientId: (apt as any).patientId }),
                scheduledAt: scheduledAt.toISOString(),
                serviceType: apt.procedure,
                estimatedValue: apt.estimatedValue,
                status: "PENDING",
            };

            const res = await fetch("/api/admin/agenda", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Erro ao salvar");
            }

            fetchAppointments();
        } catch (error: any) {
            console.error("Erro ao adicionar agendamento real:", error);
            alert(error.message || "Erro ao salvar o agendamento no banco de dados.");
        }
    };

    const hoje = new Date();
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(hoje);

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-blue-600" />
                        Agenda
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{dataFormatada}</p>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Atualizando dados...
                    </div>
                )}
            </div>

            <CalendarGrid
                appointments={appointments}
                viewDate={viewDate}
                setViewDate={setViewDate}
                onStatusChange={handleStatusChange}
                onUpdate={handleUpdate}
                onAdd={handleAdd}
            />
        </div>
    );
}
