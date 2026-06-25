import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { ChartsSectionProps } from "@/src/types/dashboard/dashboard";

const PIE_COLORS = ["#0284c7", "#4f46e5", "#10b981", "#f59e0b", "#64748b"];

const AREA_CONFIG = [
    { key: "leads", name: "Leads Captados", color: "#0284c7" },
    { key: "confirmed", name: "Confirmadas", color: "#10b981" },
    { key: "completed", name: "Realizadas", color: "#4f46e5" },
    { key: "pending", name: "Pendentes", color: "#f59e0b" },
    { key: "cancelled", name: "Canceladas", color: "#f43f5e" },
];

export function ChartsSection({ dailyData, sourceData }: ChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-950">Consultas e Leads — Mês Atual</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Evolução diária de leads e consultas por status no mês corrente</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                {AREA_CONFIG.map(({ key, color }) => (
                                    <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                                labelStyle={{ fontWeight: "bold", color: "#0f172a" }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                            {AREA_CONFIG.map(({ key, name, color }) => (
                                <Area
                                    key={key}
                                    name={name}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={color}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#color-${key})`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-950">Origem dos Leads</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Distribuição por canal de marketing no mês atual</p>
                </div>
                <div className="h-[200px] w-full relative flex-1 flex items-center justify-center">
                    {sourceData.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum dado disponível</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    {sourceData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                            <span className="text-slate-600 truncate">{item.name}</span>
                            <span className="font-bold text-slate-900 ml-auto">({item.value})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
