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
import { getProtheticWorks, updateProtheticWork, deleteProtheticWork } from "@/src/services/trabalhos";
import { toast, ToastContainer } from "react-toastify";
import { DeleteDialogGeneric } from "@/src/app/components/admin/delete-dialog-generic";
import { maskCPF } from "@/src/lib/masks";
import Link from "next/link";
import { ProtheticWork, ProtheticWorksResponse, DashboardStats } from "@/src/types/dashboard/trabalho";
import { TrabalhoFormDialog } from "./trabalho-form-dialog";

import { useDebounce } from "@/src/hook/use-debounce";
import { SearchInput } from "@/src/app/components/admin/search-input";
import { Pagination } from "@/src/app/components/admin/pagination";


const STATUS_CONFIG = {
    PENDING: {
        label: "Pendente",
        className: "bg-amber-500/10 text-amber-600 border-amber-200/50",
        icon: <Clock className="h-3 w-3" />,
    },
    DONE: {
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
    initialSearch = "",
}: {
    initialData: ProtheticWorksResponse;
    stats: DashboardStats;
    initialSearch?: string;
}) {
    const [data, setData] = useState<ProtheticWorksResponse>(initialData);
    const [statsData, setStatsData] = useState<DashboardStats>(stats);
    const [filters, setFilters] = useState<any>({ page: 1, limit: 20 });
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 700);

    useEffect(() => {
        fetchWorks({
            page: 1,
            query: debouncedSearchTerm || undefined,
            status: statusFilter || undefined,
        });
    }, [debouncedSearchTerm, statusFilter]);

    const fetchWorks = (newFilters: any) => {
        startTransition(async () => {
            const result = await getProtheticWorks(newFilters);
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

    const refresh = () => fetchWorks(filters);

    const handleQuickStatus = (work: ProtheticWork, targetStatus: "DONE") => {
        startTransition(async () => {
            const payload = {
                patientId: work.patientId,
                patientName: work.patientName,
                patientCpf: work.patientCpf,
                laboratory: work.laboratory,
                workName: work.workName,
                description: work.description,
                status: targetStatus,
                sentAt: new Date(work.sentAt).toISOString().slice(0, 10),
                teethInvolved: work.teethInvolved,
                value: work.value,
                notes: work.notes,
            };
            const res = await updateProtheticWork(work.id, payload);
            if (res.success) {
                toast.success("Trabalho concluído!");
                refresh();
            } else {
                toast.error(res.error || "Erro ao atualizar status");
            }
        });
    };

    const deleteWithId = async (id: string) => {
        const item = data.protheticWorks.find(t => t.id === id);
        return deleteProtheticWork(id, item?.patientId ?? undefined);
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
                        <p className="text-2xl font-bold text-slate-800">{statsData.pending}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pendentes</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-emerald-100 p-4 bg-white shadow-xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{statsData.done}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Concluídos</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border">
                <div className="flex flex-wrap items-center gap-2">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar paciente, lab ou trabalho..."
                        className="w-[260px]"
                    />


                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">Todos os status</option>
                        <option value="PENDING">Pendente</option>
                        <option value="DONE">Concluído</option>
                    </select>

                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-500 ml-2" />}
                </div>

                <TrabalhoFormDialog onSuccess={refresh} />
            </div>

            <div className="rounded-xl border bg-white overflow-hidden shadow-xs">
                <Table>
                    <TableHeader className="bg-slate-900 border-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-bold text-slate-100 py-3.5 rounded-tl-xl pl-4">Trabalho / Lab</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Paciente</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Data Envio</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-100 py-3.5 pr-4 rounded-tr-xl">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.protheticWorks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                    Nenhum trabalho registrado ou encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.protheticWorks.map((t) => {
                                const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.PENDING;
                                return (
                                    <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="py-4 pl-4">
                                            <div className="font-bold text-slate-800">{t.workName}</div>
                                            <div className="text-xs text-slate-400 font-medium">Destino: <span className="font-semibold text-slate-600">{t.laboratory}</span></div>
                                            {t.teethInvolved && (
                                                <div className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded w-fit mt-1">Dentes: {t.teethInvolved}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {t.patientId ? (
                                                <Link href={`/admin/pacientes/${t.patientId}`} className="font-semibold text-blue-600 hover:underline">
                                                    {t.patientName}
                                                </Link>
                                            ) : (
                                                <span className="font-medium text-slate-700">{t.patientName}</span>
                                            )}
                                            {t.patientCpf && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{maskCPF(t.patientCpf)}</div>}
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-medium text-sm py-4">{formatDate(t.sentAt)}</TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={`flex items-center gap-1 w-fit rounded-lg ${statusCfg.className}`}>
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-4">
                                            <div className="flex justify-end gap-1.5">
                                                {t.status === "PENDING" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuickStatus(t, "DONE")}
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
                                                    description={`O registro do trabalho "${t.workName}" de ${t.patientName} será excluído permanentemente.`}
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

                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={data.limit}
                    itemName="trabalhos"
                    onPageChange={(page) => fetchWorks({ ...filters, page })}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}
