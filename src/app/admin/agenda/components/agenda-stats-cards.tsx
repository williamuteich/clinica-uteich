"use client";

import { AgendaStatsCardsProps } from "@/src/types/dashboard/agendamento";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

export function AgendaStatsCards({ stats }: AgendaStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs hover:border-slate-350 transition-all duration-200 select-none">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Agendados</p>
                    <p className="text-sm font-black text-slate-800 mt-1 leading-none">{stats.total}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs hover:border-emerald-200 transition-all duration-200 select-none">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Confirmados</p>
                    <p className="text-sm font-black text-emerald-700 mt-1 leading-none">{stats.confirmados}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs hover:border-amber-200 transition-all duration-200 select-none">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Pendentes</p>
                    <p className="text-sm font-black text-amber-700 mt-1 leading-none">{stats.pendentes}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs hover:border-rose-200 transition-all duration-200 select-none">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <XCircle className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Cancelados</p>
                    <p className="text-sm font-black text-rose-605 mt-1 leading-none">{stats.cancelados}</p>
                </div>
            </div>
        </div>
    );
}
