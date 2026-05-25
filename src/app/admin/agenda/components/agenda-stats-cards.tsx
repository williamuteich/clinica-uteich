"use client";

import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

interface AgendaStatsCardsProps {
    monthName: string;
    stats: {
        total: number;
        confirmados: number;
        pendentes: number;
        cancelados: number;
    };
}

export function AgendaStatsCards({ monthName, stats }: AgendaStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="bg-linear-to-br from-white to-blue-50/20 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        No Mês ({monthName})
                    </p>
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
    );
}
