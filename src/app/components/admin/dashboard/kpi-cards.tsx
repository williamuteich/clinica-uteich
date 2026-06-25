import { Users, Calendar, TrendingUp, CheckCircle2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KpiCardsProps } from "@/src/types/dashboard/dashboard";

export function KpiCards({ stats }: KpiCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Leads (30d)</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
                    </div>
                </div>
                {stats.leadsTrend !== 0 && (
                    <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${stats.leadsTrend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {stats.leadsTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(Math.round(stats.leadsTrend))}%
                    </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Agendamentos (30d)</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p>
                    </div>
                </div>
                {stats.appointmentsTrend !== 0 && (
                    <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${stats.appointmentsTrend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {stats.appointmentsTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(Math.round(stats.appointmentsTrend))}%
                    </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Pacientes Ativos</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalPatients}</p>
                </div>
            </div>
        </div>
    );
}
