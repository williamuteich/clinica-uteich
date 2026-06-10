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
    AlertTriangle, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { getTrabalhos, updateTrabalho, deleteTrabalho } from "@/src/services/trabalhos";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogGeneric } from "@/src/app/components/delete-dialog-generic";
import { maskCPF } from "@/src/lib/masks";
import Link from "next/link";
import { Trabalho, TrabalhosResponse, DashboardStats } from "@/src/types/dashboard/trabalho";
import { TrabalhoFormDialog } from "./trabalho-form-dialog";

const STATUS_CONFIG = {
    EM_ANDAMENTO: {
        label: "Em Andamento",
        className: "bg-blue-500/10 text-blue-600 border-blue-200/50",
        icon: <Clock className="h-3 w-3" />,
    },
    PRONTO: {
        label: "Pronto para Instalação",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    FINALIZADO: {
        label: "Finalizado",
        className: "bg-slate-100 text-slate-500 border-slate-200",
        icon: <XCircle className="h-3 w-3" />,
    },
};

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
}

function isAtrasado(t: Trabalho) {
    if (!t.previsaoRetorno) return false;
    return t.status === "EM_ANDAMENTO" && new Date(t.previsaoRetorno) < new Date();
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
    const [atrasadoFilter, setAtrasadoFilter] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchTrabalhos({
                page: 1,
                query: searchTerm || undefined,
                status: statusFilter || undefined,
                atrasado: atrasadoFilter ? true : undefined,
            });
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm, statusFilter, atrasadoFilter]);

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

    const handleQuickStatus = (trabalho: Trabalho, targetStatus: "PRONTO" | "FINALIZADO") => {
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
                previsaoRetorno: trabalho.previsaoRetorno
                    ? new Date(trabalho.previsaoRetorno).toISOString().slice(0, 10)
                    : null,
                dataRecebimento: targetStatus === "PRONTO"
                    ? new Date().toISOString().slice(0, 10)
                    : (trabalho.dataRecebimento
                        ? new Date(trabalho.dataRecebimento).toISOString().slice(0, 10)
                        : null),
                dentesEnvolvidos: trabalho.dentesEnvolvidos,
                valor: trabalho.valor,
                observacoes: trabalho.observacoes,
            };
            const res = await updateTrabalho(trabalho.id, payload);
            if (res.success) {
                toast.success("Status atualizado!");
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-blue-100 p-4 bg-white shadow-xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                        <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{statsData.ativos}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Em Andamento</p>
                    </div>
                </div>

                <div className={`flex items-center gap-4 rounded-xl border p-4 bg-white shadow-xs ${statsData.atrasados > 0 ? "border-amber-200 bg-amber-50/10" : "border-slate-100"}`}>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${statsData.atrasados > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-2xl font-bold ${statsData.atrasados > 0 ? "text-amber-600" : "text-slate-800"}`}>{statsData.atrasados}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trabalhos Atrasados</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-emerald-100 p-4 bg-white shadow-xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{statsData.recebidosHoje}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recebidos Hoje</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar paciente, lab ou prótese..."
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
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="PRONTO">Pronto</option>
                        <option value="FINALIZADO">Finalizado</option>
                    </select>

                    <button
                        onClick={() => setAtrasadoFilter(!atrasadoFilter)}
                        className={`h-10 px-4 rounded-md border text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${atrasadoFilter
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50/50"
                            }`}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Apenas Atrasados
                    </button>

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
                            <TableHead className="font-bold text-slate-700">Previsão Retorno</TableHead>
                            <TableHead className="font-bold text-slate-700">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.trabalhos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                    Nenhum trabalho protético registrado ou encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.trabalhos.map((t) => {
                                const delayed = isAtrasado(t);
                                const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.EM_ANDAMENTO;
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
                                            {delayed ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                        {formatDate(t.previsaoRetorno)}
                                                    </span>
                                                    <span className="text-[10px] text-amber-500 font-bold uppercase">Prazo Vencido</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 font-medium text-sm">{formatDate(t.previsaoRetorno)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`flex items-center gap-1 w-fit rounded-lg ${statusCfg.className}`}>
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {t.status === "EM_ANDAMENTO" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuickStatus(t, "PRONTO")}
                                                        className="h-8 text-xs font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                                        title="Recebido do Laboratório"
                                                    >
                                                        ✓ Recebido
                                                    </Button>
                                                )}
                                                {t.status === "PRONTO" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuickStatus(t, "FINALIZADO")}
                                                        className="h-8 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                                                        title="Instalado no Paciente"
                                                    >
                                                        ✓ Instalar
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
                                                    successMessage="Trabalho protético removido!"
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
