"use client";

import { useState, useCallback, useTransition, useEffect, useRef, memo } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, CheckCircle2, BarChart3, HelpCircle } from "lucide-react";
import { Lead, LeadStats } from "@/src/types/dashboard/leads";
import { ToastContainer } from "react-toastify";
import { DeleteDialogGeneric } from "@/src/app/components/admin/delete-dialog-generic";
import { maskPhone } from "@/src/lib/masks";
import { getLeads, deleteLead } from "@/src/services/leads";
import { useDebounce } from "@/src/hook/use-debounce";
import { SearchInput } from "@/src/app/components/admin/search-input";
import { Pagination } from "@/src/app/components/admin/pagination";

const LeadRow = memo(({
    lead,
    isPending,
    onDeleteSuccess,
}: {
    lead: Lead;
    isPending: boolean;
    onDeleteSuccess: () => void;
}) => {
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
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-200/50">
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
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50">
                        Realizado
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        {status}
                    </Badge>
                );
        }
    };

    const utmInfo = [lead.utmSource, lead.utmMedium].filter(Boolean).join(" / ");

    return (
        <TableRow className={`hover:bg-muted/30 transition-opacity ${isPending ? "opacity-50" : ""}`}>
            <TableCell className="font-semibold text-slate-800 py-4 pl-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100 shadow-2xs">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700">{lead.name}</span>
                </div>
            </TableCell>
            <TableCell className="text-sm py-4">{maskPhone(lead.phone)}</TableCell>
            <TableCell className="text-sm py-4">{lead.serviceType || "-"}</TableCell>
            <TableCell className="py-4">{getStatusBadge(lead.status)}</TableCell>
            <TableCell className="text-sm text-slate-500 py-4">
                {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            </TableCell>
            <TableCell className="text-sm text-slate-500 py-4">
                {utmInfo ? (
                    <span className="inline-block max-w-[150px] truncate" title={utmInfo}>
                        {utmInfo}
                    </span>
                ) : (
                    <span className="text-slate-300">-</span>
                )}
            </TableCell>
            <TableCell className="text-right py-4 pr-4">
                <div className="flex justify-end gap-1">
                    <DeleteDialogGeneric
                        id={lead.id}
                        onDelete={deleteLead}
                        onSuccess={onDeleteSuccess}
                        title="Remover Lead?"
                        description={`Os dados de captação de ${lead.name} serão excluídos permanentemente.`}
                        successMessage="Lead removido com sucesso!"
                        errorMessage="Erro ao remover lead."
                    />
                </div>
            </TableCell>
        </TableRow>
    );
});
LeadRow.displayName = "LeadRow";

export function LeadsManagement({ initialData }: { initialData: { leads: Lead[]; stats: LeadStats; total: number; page: number; limit: number; totalPages: number } }) {
    const [data, setData] = useState(initialData);
    const [filters, setFilters] = useState({ page: 1, limit: 20, search: "", status: "" });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 700);
    const isFirstRender = useRef(true);

    const fetchLeads = useCallback((newFilters: typeof filters) => {
        startTransition(async () => {
            const result = await getLeads(newFilters);
            if (result) {
                setData(result);
                setFilters(newFilters);
            }
        });
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        fetchLeads({
            ...filters,
            search: debouncedSearch,
            page: 1,
        });
    }, [debouncedSearch, fetchLeads, filters.limit]);

    const handleStatusFilterChange = (status: string) => {
        fetchLeads({
            ...filters,
            status,
            page: 1,
        });
    };

    const handleDeleteSuccess = useCallback(() => {
        fetchLeads(filters);
    }, [fetchLeads, filters]);

    return (
        <div className="space-y-6">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Leads</p>
                        <p className="text-2xl font-bold text-slate-900">{data.stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Interessados</p>
                        <p className="text-2xl font-bold text-slate-900">{data.stats.interested}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Realizados</p>
                        <p className="text-2xl font-bold text-slate-900">{data.stats.converted}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Taxa de Conversão</p>
                        <p className="text-2xl font-bold text-slate-900">{data.stats.conversionRate}%</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nome ou telefone..."
                        className="w-[280px]"
                    />

                    <select
                        value={filters.status}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos os Status</option>
                        <option value="INTERESTED">Interessados</option>
                        <option value="PENDING">Pendentes</option>
                        <option value="CONFIRMED">Confirmados</option>
                        <option value="CANCELLED">Cancelados</option>
                        <option value="COMPLETED">Realizados</option>
                    </select>

                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                </div>
            </div>

            <div className="border rounded-xl bg-white shadow-xs overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 border-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-bold text-slate-100 py-3.5 rounded-tl-xl pl-4">Lead</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Telefone</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Serviço de Interesse</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Status</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Data Captação</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">UTM Origem</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5 text-right pr-4 rounded-tr-xl">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Nenhum lead encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.leads.map((lead) => (
                                <LeadRow
                                    key={lead.id}
                                    lead={lead}
                                    isPending={isPending}
                                    onDeleteSuccess={handleDeleteSuccess}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>

                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={data.limit}
                    itemName="leads"
                    onPageChange={(page) => fetchLeads({ ...filters, page })}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}
