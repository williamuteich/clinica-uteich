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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    User,
    Calendar as CalendarIcon,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { AuditLog, AuditLogsResponse, AuditFilters } from "@/src/types/dashboard/audit";
import { getAuditLogs } from "@/src/services/audit";

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

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== (filters.userName || "")) {
                fetchLogs({ ...filters, userName: searchTerm || undefined, page: 1 });
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

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
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filtrar por usuário..."
                            className="pl-9 w-[240px] h-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

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



            <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px]">Usuário</TableHead>
                            <TableHead className="w-[120px]">Ação</TableHead>
                            <TableHead>Recurso</TableHead>
                            <TableHead>Alvo (Nome)</TableHead>
                            <TableHead className="hidden md:table-cell">Caminho</TableHead>
                            <TableHead className="text-right">Horário</TableHead>
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
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 flex items-center gap-1.5">
                                                <User className="h-3 w-3 text-slate-400" /> {log.administrator.name || "Sem nome"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">{log.administrator.role?.name || "Master"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getActionBadge(log.action)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                                            <FileText className="h-3 w-3 text-slate-400" /> {log.resource === "usuarios" ? "Usuários" : log.resource === "cargos" ? "Cargos" : log.resource}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-slate-900">
                                            {log.resourceName || log.resourceId || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span className="text-xs text-muted-foreground font-mono">{log.url}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-slate-700">
                                                {new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="h-2.5 w-2.5" /> {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {data.totalPages > 1 && (
                    <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Mostrando <span className="font-medium">{(data.page - 1) * 20 + 1}</span>-
                            <span className="font-medium">{Math.min(data.page * 20, data.total)}</span> de
                            <span className="font-medium"> {data.total}</span> registros
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(data.page - 1)}
                                disabled={data.page === 1 || isPending}
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <div className="flex items-center gap-1 px-2">
                                <span className="text-sm font-medium">{data.page}</span>
                                <span className="text-sm text-muted-foreground">/</span>
                                <span className="text-sm text-muted-foreground">{data.totalPages}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(data.page + 1)}
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
