"use client";

import { useState, useTransition, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Calendar as CalendarIcon,
    FileText,
    Loader2,
} from "lucide-react";
import { AuditLogsResponse, AuditFilters } from "@/src/types/dashboard/audit";
import { useDebounce } from "@/src/hook/use-debounce";
import { getAuditLogs } from "@/src/services/audit";
import { SearchInput } from "@/src/app/components/admin/search-input";
import { Pagination } from "@/src/app/components/admin/pagination";


export function AuditManagement({
    initialData
}: {
    initialData: AuditLogsResponse
}) {
    const [data, setData] = useState<AuditLogsResponse>(initialData);
    const [filters, setFilters] = useState<AuditFilters>({
        page: 1,
        limit: 20
    });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 700);

    useEffect(() => {
        if (debouncedSearchTerm !== (filters.userName || "")) {
            fetchLogs({ ...filters, userName: debouncedSearchTerm || undefined, page: 1 });
        }
    }, [debouncedSearchTerm]);

    const fetchLogs = (newFilters: AuditFilters) => {
        startTransition(async () => {
            const result = await getAuditLogs(newFilters);
            if (result) {
                setData(result);
                setFilters(newFilters);
            }
        });
    };

    const handlePageChange = (newPage: number) => {
        fetchLogs({ ...filters, page: newPage });
    };

    const handleFilterChange = (key: keyof AuditFilters, value: string | undefined) => {
        fetchLogs({ ...filters, [key]: value, page: 1 });
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case "CREATE":
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50">CRIOU</Badge>;
            case "UPDATE":
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50">EDITOU</Badge>;
            case "DELETE":
                return <Badge className="bg-red-500/10 text-red-600 border-red-200/50">EXCLUIU</Badge>;
            default:
                return <Badge variant="secondary">{action}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Filtrar por usuário..."
                        className="w-[240px]"
                    />


                    <select
                        className="h-10 px-3 py-2 border rounded-md bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-w-auto"
                        value={filters.action || ""}
                        onChange={(e) => handleFilterChange("action", e.target.value)}
                    >
                        <option value="">Todas as Ações</option>
                        <option value="CREATE">Criação</option>
                        <option value="UPDATE">Edição</option>
                        <option value="DELETE">Exclusão</option>
                    </select>

                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
                </div>
            </div>



            <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-900 border-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[180px] font-bold text-slate-100 py-3.5 rounded-tl-xl pl-4">Usuário</TableHead>
                            <TableHead className="w-[120px] font-bold text-slate-100 py-3.5">Ação</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Recurso</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Alvo (Nome)</TableHead>
                            <TableHead className="hidden md:table-cell font-bold text-slate-100 py-3.5">Caminho</TableHead>
                            <TableHead className="text-right font-bold text-slate-100 py-3.5 pr-4 rounded-tr-xl">Horário</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Nenhum log de auditoria encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="py-4 pl-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-slate-400" /> {log.administrator.name || "Sem nome"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-semibold">{log.administrator.role?.name || "Master"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">{getActionBadge(log.action)}</TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                                            <FileText className="h-3.5 w-3.5 text-slate-400" /> {log.resource === "usuarios" ? "Usuários" : log.resource === "cargos" ? "Cargos" : log.resource}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="font-semibold text-slate-900">
                                            {log.resourceName || log.resourceId || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell py-4">
                                        <span className="text-xs text-muted-foreground font-mono">{log.url}</span>
                                    </TableCell>
                                    <TableCell className="text-right py-4 pr-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold mt-0.5">
                                                <CalendarIcon className="h-2.5 w-2.5" /> {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={20}
                    itemName="registros"
                    onPageChange={handlePageChange}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}
