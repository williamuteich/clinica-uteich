"use client";

import { useState, useCallback, useTransition, useEffect, useRef, memo } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, User } from "lucide-react";
import { PacientesResponse, PacienteFilters } from "@/src/types/dashboard/pacientes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { CreatePacienteDialog } from "./create-paciente-dialog";
import { CreatePatientLinkDialog } from "@/src/app/components/admin/create-dialog-link";
import { DeleteDialogGeneric } from "@/src/app/components/admin/delete-dialog-generic";
import { maskCPF, maskPhone } from "@/src/lib/masks";
import { getPacientes, deletePaciente } from "@/src/services/pacientes";
import { useDebounce } from "@/src/hook/use-debounce";
import { SearchInput } from "@/src/app/components/admin/search-input";
import { Pagination } from "@/src/app/components/admin/pagination";

const PacienteRow = memo(({
    paciente,
    isPending,
    onDeleteSuccess,
}: {
    paciente: any;
    isPending: boolean;
    onDeleteSuccess: () => void;
    filters: PacienteFilters;
}) => {
    return (
        <TableRow className={`hover:bg-muted/30 transition-opacity ${isPending ? "opacity-50" : ""}`}>
            <TableCell className="font-semibold text-slate-800 py-4 pl-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700">{paciente.name}</span>
                </div>
            </TableCell>
            <TableCell className="text-sm text-slate-500 font-mono py-4">{maskCPF(paciente.cpf)}</TableCell>
            <TableCell className="text-sm py-4">{maskPhone(paciente.phone)}</TableCell>
            <TableCell className="py-4">
                <Badge
                    variant={paciente.active ? "default" : "secondary"}
                    className={paciente.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-200/50" : ""}
                >
                    {paciente.active ? "Ativo" : "Inativo"}
                </Badge>
            </TableCell>
            <TableCell className="text-right py-4 pr-4">
                <div className="flex justify-end gap-1">
                    <Link href={`/admin/pacientes/${paciente.id}`} title="Acessar Prontuário">
                        <Button variant="ghost" size="icon-sm" type="button">
                            <FileText className="h-4 w-4 text-slate-500" />
                        </Button>
                    </Link>
                    <DeleteDialogGeneric
                        id={paciente.id}
                        onDelete={deletePaciente}
                        onSuccess={onDeleteSuccess}
                        title="Remover Paciente?"
                        description={`Todos os prontuários e histórico clínico de ${paciente.name} serão excluídos permanentemente.`}
                        successMessage="Paciente removido com sucesso!"
                        errorMessage="Erro ao remover paciente."
                    />
                </div>
            </TableCell>
        </TableRow>
    );
});
PacienteRow.displayName = "PacienteRow";

export function PacientesManagement({ initialData }: { initialData: PacientesResponse }) {
    const searchParams = useSearchParams();
    const defaultOpen = searchParams.get("newPatient") === "true" || searchParams.get("cadastrar") === "true";
    const defaultName = searchParams.get("nome") || searchParams.get("name") || "";
    const defaultPhone = searchParams.get("telefone") || searchParams.get("phone") || "";

    const [data, setData] = useState<PacientesResponse>(initialData);
    const [filters, setFilters] = useState<PacienteFilters>({ page: 1, limit: 20 });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 700);
    const isFirstRender = useRef(true);

    const fetchPacientes = useCallback((newFilters: PacienteFilters) => {
        startTransition(async () => {
            const result = await getPacientes(newFilters);
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
        const isCpf = /^\d+$/.test(debouncedSearch);
        fetchPacientes({
            ...filters,
            name: isCpf || !debouncedSearch ? undefined : debouncedSearch,
            cpf: isCpf ? debouncedSearch : undefined,
            page: 1,
            limit: filters.limit,
        });
    }, [debouncedSearch, fetchPacientes, filters.limit]);

    const handleDeleteSuccess = useCallback(() => {
        fetchPacientes(filters);
    }, [fetchPacientes, filters]);

    return (
        <div className="space-y-4">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nome ou CPF..."
                        className="w-[260px]"
                    />
                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}

                </div>
                <div className="flex items-center gap-2">
                    <CreatePatientLinkDialog />
                    <CreatePacienteDialog
                        onCreateSuccess={() => fetchPacientes(filters)}
                        defaultOpen={defaultOpen}
                        defaultName={defaultName}
                        defaultPhone={defaultPhone}
                    />
                </div>
            </div>

            <div className="border rounded-xl bg-white shadow-xs overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 border-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-bold text-slate-100 py-3.5 rounded-tl-xl pl-4">Paciente</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">CPF</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Telefone</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Status</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5 text-right pr-4 rounded-tr-xl">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.pacientes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Nenhum paciente cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.pacientes.map((paciente) => (
                                <PacienteRow
                                    key={paciente.id}
                                    paciente={paciente}
                                    isPending={isPending}
                                    onDeleteSuccess={handleDeleteSuccess}
                                    filters={filters}
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
                    itemName="pacientes"
                    onPageChange={(page) => fetchPacientes({ ...filters, page })}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}