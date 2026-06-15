"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AgendaStatsCards } from "./agenda-stats-cards";
import { CalendarNavBar } from "./calendar-nav-bar";
import { AppointmentDetailsDialog } from "./appointment-details-dialog";
import { AddAppointmentDialog } from "./add-appointment-dialog";
import { Appointment, CalendarGridProps } from "@/src/types/dashboard/agendamento";

const STATUS_THEMES = {
    Confirmado: {
        bg: "bg-emerald-50/40 border-emerald-100/70 border-l-emerald-500 text-emerald-800 hover:bg-emerald-50/80",
    },
    Pendente: {
        bg: "bg-amber-50/40 border-amber-100/70 border-l-amber-500 text-amber-900 hover:bg-amber-50/80",
    },
    Finalizado: {
        bg: "bg-indigo-50/40 border-indigo-100/70 border-l-indigo-500 text-indigo-800 hover:bg-indigo-50/80",
    },
    Cancelado: {
        bg: "bg-slate-50/40 border-slate-200/75 border-l-slate-400 text-slate-400 hover:bg-slate-50/80 opacity-60 line-through",
    },
};

function buildCalendarCells(year: number, month: number, todayStr: string) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    const toDateStr = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    for (let i = startWeekDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevLastDay - i);
        const dateStr = toDateStr(d);
        cells.push({ dateStr, dayNum: prevLastDay - i, isCurrentMonth: false, isToday: dateStr === todayStr });
    }
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = toDateStr(new Date(year, month, d));
        cells.push({ dateStr, dayNum: d, isCurrentMonth: true, isToday: dateStr === todayStr });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        const dateStr = toDateStr(new Date(year, month + 1, d));
        cells.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: dateStr === todayStr });
    }

    return cells;
}

export default function CalendarGrid({
    appointments,
    viewDate,
    setViewDate,
    onStatusChange,
    onUpdate,
    onAdd,
}: CalendarGridProps) {
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const cells = buildCalendarCells(year, month, todayStr);
    const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(viewDate);
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    const currentMonthApts = appointments.filter((apt) => {
        const d = new Date(apt.date + "T00:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const stats = {
        total: currentMonthApts.length,
        confirmados: currentMonthApts.filter((a) => a.status === "Confirmado").length,
        pendentes: currentMonthApts.filter((a) => a.status === "Pendente").length,
        cancelados: currentMonthApts.filter((a) => a.status === "Cancelado").length,
    };

    const openAddModal = (dateStr: string) => {
        setSelectedDateStr(dateStr);
        setIsAddOpen(true);
    };

    return (
        <div className="space-y-4 w-full animate-in fade-in duration-500">
            <AgendaStatsCards monthName={monthName} stats={stats} />

            <CalendarNavBar
                monthName={monthName}
                isCurrentMonth={isCurrentMonth}
                onPrevMonth={() => setViewDate(new Date(year, month - 1, 1))}
                onNextMonth={() => setViewDate(new Date(year, month + 1, 1))}
                onGoToday={() => setViewDate(new Date())}
                onAddThisMonth={() => openAddModal(new Date().toISOString().split("T")[0])}
            />

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-900 border-b border-slate-950">
                    {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-[10px] font-black uppercase tracking-wider border-r border-slate-800 last:border-r-0 text-white select-none"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-150 border-b border-slate-150">
                    {cells.map((cell, idx) => {
                        const cellApts = cell.isCurrentMonth
                            ? appointments.filter((apt) => apt.date === cell.dateStr)
                            : [];

                        return (
                            <div
                                key={`${cell.dateStr}-${idx}`}
                                onClick={() => {
                                    if (cell.isCurrentMonth) {
                                        openAddModal(cell.dateStr);
                                    }
                                }}
                                className={cn(
                                    "min-h-24 sm:min-h-28 p-2 flex flex-col justify-between select-none group",
                                    !cell.isCurrentMonth
                                        ? "bg-slate-50/30 text-slate-300 opacity-45 cursor-default"
                                        : "hover:bg-slate-50 transition-colors cursor-pointer",
                                    cell.isToday && "bg-blue-50/20"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={cn(
                                            "text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full",
                                            cell.isToday
                                                ? "bg-blue-600 text-white"
                                                : cell.isCurrentMonth
                                                    ? "text-slate-700"
                                                    : "text-slate-400"
                                        )}
                                    >
                                        {cell.dayNum}
                                    </span>
                                </div>

                                <div className="mt-1 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden max-h-20 scrollbar-none">
                                    {cellApts.map((apt) => {
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
                                                    "w-full text-left p-1.5 border-t border-r border-b border-l-3 text-[10px] font-semibold rounded-md transition-all truncate flex items-center justify-between gap-1.5 shadow-3xs hover:translate-x-0.5 cursor-pointer leading-tight",
                                                    theme.bg
                                                )}
                                            >
                                                <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                                                    <span className="font-bold text-[9px] opacity-75 shrink-0">{apt.time}</span>
                                                    <span className="truncate text-slate-800 font-semibold">{apt.patientName}</span>
                                                </div>
                                                {apt.patientId && !apt.isGuest && (
                                                    <Link
                                                        href={`/admin/pacientes/${apt.patientId}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="ml-1.5 rounded bg-white/90 px-1 py-0.5 text-[8px] font-bold text-blue-600 border border-blue-100 hover:bg-blue-650 hover:text-white transition-all shrink-0"
                                                    >
                                                        Ficha
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {cellApts.length > 0 && (
                                    <div className="mt-1 flex items-center justify-between text-[7.5px] font-bold uppercase tracking-wider text-slate-400">
                                        <span>
                                            {cellApts.length} {cellApts.length === 1 ? "Consulta" : "Consultas"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <AppointmentDetailsDialog
                open={isDetailsOpen}
                onOpenChange={(v) => {
                    setIsDetailsOpen(v);
                    if (!v) setSelectedApt(null);
                }}
                appointment={selectedApt}
                onStatusChange={onStatusChange}
                onUpdate={onUpdate}
            />

            <AddAppointmentDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                selectedDateStr={selectedDateStr}
                onDateChange={setSelectedDateStr}
                onAdd={onAdd}
                appointments={appointments}
            />
        </div>
    );
}
