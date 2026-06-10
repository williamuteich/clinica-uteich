"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CalendarNavBarProps } from "@/src/types/dashboard/components";

export function CalendarNavBar({
    monthName,
    isCurrentMonth,
    onPrevMonth,
    onNextMonth,
    onGoToday,
    onAddThisMonth,
}: CalendarNavBarProps) {
    return (
        <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevMonth}
                    className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Mês Anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={onGoToday}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer uppercase tracking-wider"
                >
                    Hoje
                </button>
                <button
                    onClick={onNextMonth}
                    className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Próximo Mês"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                <span
                    className={`${isCurrentMonth ? "text-blue-600" : "text-slate-600"
                        } text-sm md:text-base font-black uppercase tracking-wide ml-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100`}
                >
                    {monthName}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onAddThisMonth}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-all cursor-pointer uppercase tracking-wider"
                >
                    <Plus className="h-4 w-4" />
                    Agendar Neste Mês
                </button>
            </div>
        </div>
    );
}
