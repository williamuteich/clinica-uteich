"use client";

import { useState, useTransition, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, Search, Pencil,
    CheckCircle2, Clock, ChevronLeft, ChevronRight
} from "lucide-react";
import { getTrabalhos, updateTrabalho, deleteTrabalho } from "@/src/services/trabalhos";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogGeneric } from "@/src/app/components/delete-dialog-generic";
import { maskCPF } from "@/src/lib/masks";
import Link from "next/link";
import { Trabalho, TrabalhosResponse, DashboardStats } from "@/src/types/dashboard/trabalho";
import { TrabalhoFormDialog } from "./trabalho-form-dialog";

const STATUS_CONFIG = {
    PENDENTE: {
        label: "Pendente",
        className: "bg-amber-500/10 text-amber-600 border-amber-200/50",
        icon: <Clock className="h-3 w-3" />,
    },
    CONCLUIDO: {
        label: "Concluído",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
};

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function TrabalhosManagement({
    initialData,
    stats,
}: {
    initialData: TrabalhosResponse;
    stats: DashboardStats;
}) {
    const [data, setData] = useState<TrabalhosResponse>(initialData);
    const [statsData, setStatsData] = useState<DashboardStats>(stats);
    const [filters, setFilters] = useState<any>({ page: 1, limit: 20 });
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchTrabalhos({
                page: 1,
                query: searchTerm || undefined,
                status: statusFilter || undefined,
            });
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm, statusFilter]);

    const fetchTrabalhos = (newFilters: any) => {
        startTransition(async () => {
            const result = await getTrabalhos(newFilters);
            if (result) {
                setData(result);
                setFilters(newFilters);
            }
            const resStats = await fetch("/api/admin/trabalhos/dashboard");
            if (resStats.ok) {
                const s = await resStats.json();
                setStatsData(s);
            }
        });
    };

    const refresh = () => fetchTrabalhos(filters);

    const handleQuickStatus = (trabalho: Trabalho, targetStatus: "CONCLUIDO") => {
        startTransition(async () => {
            const payload = {
                pacienteId: trabalho.pacienteId,
                nomePaciente: trabalho.nomePaciente,
                cpfPaciente: trabalho.cpfPaciente,
                laboratorio: trabalho.laboratorio,
                nomeTrabalho: trabalho.nomeTrabalho,
                descricao: trabalho.descricao,
                status: targetStatus,
                dataEnvio: new Date(trabalho.dataEnvio).toISOString().slice(0, 10),
                dentesEnvolvidos: trabalho.dentesEnvolvidos,
                valor: trabalho.valor,
                observacoes: trabalho.observacoes,
            };
            const res = await updateTrabalho(trabalho.id, payload);
            if (res.success) {
                toast.success("Trabalho concluído!");
                refresh();
            } else {
                toast.error(res.error || "Erro ao atualizar status");
            }
        });
    };

    const deleteWithId = async (id: string) => {
        const item = data.trabalhos.find(t => t.id === id);
        return deleteTrabalho(id, item?.pacienteId ?? undefined);
    };

    return (
        <div className="space-y-6">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-amber-100 p-4 bg-white shadow-xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                        <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{statsData.pendentes}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pendentes</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-emerald-100 p-4 bg-white shadow-xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{statsData.concluidos}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Concluídos</p>
                    </div>
                </div>
            </div>

            {/* Filters + New */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar paciente, lab ou trabalho..."
                            className="pl-9 w-[260px] h-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">Todos os status</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="CONCLUIDO">Concluído</option>
                    </select>

                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-500 ml-2" />}
                </div>

                <TrabalhoFormDialog onSuccess={refresh} />
            </div>

            <div className="rounded-xl border bg-white overflow-hidden shadow-xs">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Trabalho / Lab</TableHead>
                            <TableHead className="font-bold text-slate-700">Paciente</TableHead>
                            <TableHead className="font-bold text-slate-700">Data Envio</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.trabalhos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                    Nenhum trabalho registrado ou encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.trabalhos.map((t) => {
                                const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.PENDENTE;
                                return (
                                    <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-bold text-slate-800">{t.nomeTrabalho}</div>
                                            <div className="text-xs text-slate-400 font-medium">Destino: <span className="font-semibold text-slate-600">{t.laboratorio}</span></div>
                                            {t.dentesEnvolvidos && (
                                                <div className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded w-fit mt-1">Dentes: {t.dentesEnvolvidos}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {t.pacienteId ? (
                                                <Link href={`/admin/pacientes/${t.pacienteId}`} className="font-semibold text-blue-600 hover:underline">
                                                    {t.nomePaciente}
                                                </Link>
                                            ) : (
                                                <span className="font-medium text-slate-700">{t.nomePaciente}</span>
                                            )}
                                            {t.cpfPaciente && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{maskCPF(t.cpfPaciente)}</div>}
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-medium text-sm">{formatDate(t.dataEnvio)}</TableCell>
                                        <TableCell>
                                            <Badge className={`flex items-center gap-1 w-fit rounded-lg ${statusCfg.className}`}>
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {t.status === "PENDENTE" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuickStatus(t, "CONCLUIDO")}
                                                        className="h-8 text-xs font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                                        title="Marcar como Concluído"
                                                    >
                                                        ✓ Concluir
                                                    </Button>
                                                )}
                                                <TrabalhoFormDialog
                                                    trabalho={t}
                                                    onSuccess={refresh}
                                                    trigger={
                                                        <Button variant="ghost" size="icon-sm" title="Editar" className="cursor-pointer">
                                                            <Pencil className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    }
                                                />
                                                <DeleteDialogGeneric
                                                    id={t.id}
                                                    onDelete={deleteWithId}
                                                    onSuccess={refresh}
                                                    title="Excluir Registro?"
                                                    description={`O registro do trabalho "${t.nomeTrabalho}" de ${t.nomePaciente} será excluído permanentemente.`}
                                                    successMessage="Trabalho removido!"
                                                    errorMessage="Erro ao remover trabalho."
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {data.totalPages > 1 && (
                    <div className="p-4 border-t bg-slate-50/50 flex items-center justify-between">
                        <div className="text-xs text-slate-400 font-medium">
                            Mostrando <span className="font-bold">{(data.page - 1) * data.limit + 1}</span>–
                            <span className="font-bold">{Math.min(data.page * data.limit, data.total)}</span> de{" "}
                            <span className="font-bold">{data.total}</span> trabalhos
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchTrabalhos({ ...filters, page: data.page - 1 })}
                                disabled={data.page === 1 || isPending}
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <span className="text-xs font-bold text-slate-600">{data.page} / {data.totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchTrabalhos({ ...filters, page: data.page + 1 })}
                                disabled={data.page === data.totalPages || isPending}
                            >
                                Próximo <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
