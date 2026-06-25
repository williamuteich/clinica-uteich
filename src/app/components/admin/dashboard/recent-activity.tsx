import {
    BarChart,
    Bar,
    Cell,
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import { Clock, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { maskPhone } from "@/src/lib/masks";
import { RecentActivityProps } from "@/src/types/dashboard/dashboard";

const COLORS = ["#0284c7", "#4f46e5", "#10b981", "#f59e0b", "#64748b"];

export function RecentActivity({
    specialtyData,
    recentLeads,
    recentAppointments
}: RecentActivityProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "INTERESTED":
                return (
                    <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 border-sky-200/50">
                        Interessado
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-200/50">
                        Pendente
                    </Badge>
                );
            case "CONFIRMED":
                return (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50">
                        Confirmado
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 border-rose-200/50">
                        Cancelado
                    </Badge>
                );
            case "COMPLETED":
                return (
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-200/50">
                        Realizado
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-950">Serviços Mais Agendados</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Especialidades com maior demanda no período</p>
                </div>
                <div className="h-[280px] w-full">
                    {specialtyData.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-slate-400">Nenhum agendamento recente</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={specialtyData} layout="vertical" margin={{ top: 0, right: 10, left: 35, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#334155", fontSize: 10, fontWeight: "bold" }} width={80} />
                                <Tooltip
                                    contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                    {specialtyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-950">Últimos Leads</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-light">Contatos recentes gerados pelo site</p>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    {recentLeads.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-10">
                            <p className="text-sm text-slate-400">Nenhum lead registrado</p>
                        </div>
                    ) : (
                        recentLeads.map((lead) => (
                            <div key={lead.id} className="flex items-start justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{lead.name}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{maskPhone(lead.phone)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold truncate max-w-[120px]" title={lead.serviceType || "Indefinido"}>
                                            {lead.serviceType || "Indefinido"}
                                        </span>
                                        {lead.utmSource && (
                                            <span className="text-[10px] text-blue-600 font-bold">
                                                #{lead.utmSource}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                    {getStatusBadge(lead.status)}
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-light">
                                        <Clock className="w-3 h-3" />
                                        {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-950">Próximas Consultas</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-light">Agendamentos marcados mais recentes</p>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    {recentAppointments.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-10">
                            <p className="text-sm text-slate-400">Nenhuma consulta agendada</p>
                        </div>
                    ) : (
                        recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-start justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{apt.patientName || "Sem Nome"}</p>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">{apt.serviceType || "Avaliação"}</p>
                                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-1 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        <CalendarDays className="w-3 h-3" />
                                        {new Date(apt.scheduledAt).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                    {getStatusBadge(apt.status)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
