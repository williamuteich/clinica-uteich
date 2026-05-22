import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface StatsPanelProps {
    total: number;
    confirmed: number;
    pending: number;
}

export default function StatsPanel({ total, confirmed, pending }: StatsPanelProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-350 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Consultas</p>
                    <p className="text-xl font-bold text-slate-800 mt-0.5">{total}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-350 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmados</p>
                    <p className="text-xl font-bold text-slate-800 mt-0.5">{confirmed}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-350 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aguardando Confirmação</p>
                    <p className="text-xl font-bold text-slate-800 mt-0.5">{pending}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-350 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ocupação Horários</p>
                    <p className="text-xl font-bold text-slate-800 mt-0.5">85%</p>
                </div>
            </div>
        </div>
    );
}
