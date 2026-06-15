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
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onPrevMonth}
                    className="p-1.5 hover:bg-slate-100 active:bg-slate-205 rounded-lg border border-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Mês Anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={onGoToday}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 transition-all cursor-pointer uppercase tracking-wider"
                >
                    Hoje
                </button>
                <button
                    onClick={onNextMonth}
                    className="p-1.5 hover:bg-slate-100 active:bg-slate-205 rounded-lg border border-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Próximo Mês"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                <span
                    className={`${
                        isCurrentMonth 
                            ? "text-blue-600 border-blue-100 bg-blue-50/20" 
                            : "text-slate-700 border-slate-200 bg-slate-50"
                    } text-xs font-black uppercase tracking-wider ml-1 px-3 py-1.5 rounded-lg border select-none`}
                >
                    {monthName}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onAddThisMonth}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[10px] font-black rounded-lg shadow-xs transition-all cursor-pointer uppercase tracking-wider"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Agendar Neste Mês
                </button>
            </div>
        </div>
    );
}
