"use client";

import { useState, useTransition, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, Pencil, Search, ChevronLeft, ChevronRight, FileText
} from "lucide-react";
import { Paciente, PacientesResponse, PacienteFilters } from "@/src/types/dashboard/pacientes";
import { getPacientes } from "@/src/services/pacientes";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import { CreatePacienteDialog } from "./create-paciente-dialog";
import { PacienteHistoricoDialog } from "./paciente-historico-dialog";
import { DeleteDialogGeneric } from "@/src/app/components/delete-dialog-generic";
import { deletePaciente } from "@/src/services/pacientes";
import { maskCPF, maskPhone } from "@/src/lib/masks";

export function PacientesManagement({ initialData }: { initialData: PacientesResponse }) {
    const [data, setData] = useState<PacientesResponse>(initialData);
    const [filters, setFilters] = useState<PacienteFilters>({ page: 1, limit: 20 });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Paciente | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            const isCpf = /[\d]/.test(searchTerm);
            if (searchTerm) {
                fetchPacientes({
                    ...filters,
                    name: isCpf ? undefined : searchTerm,
                    cpf: isCpf ? searchTerm : undefined,
                    page: 1
                });
            } else {
                fetchPacientes({
                    ...filters,
                    name: undefined,
                    cpf: undefined,
                    page: 1
                });
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchPacientes = (newFilters: PacienteFilters) => {
        startTransition(async () => {
            const result = await getPacientes(newFilters);
            if (result) {
                setData(result);
                setFilters(newFilters);
            }
        });
    };

    return (
        <div className="space-y-4">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou CPF..."
                            className="pl-9 w-[260px] h-10 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                </div>

                <CreatePacienteDialog onCreateSuccess={() => fetchPacientes(filters)} />
                <PacienteHistoricoDialog
                    paciente={selectedPatientForHistory}
                    open={historyOpen}
                    onOpenChange={setHistoryOpen}
                />
            </div>

            <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.pacientes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Nenhum paciente cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.pacientes.map((paciente) => (
                                <TableRow key={paciente.id} className={`hover:bg-muted/30 transition-opacity ${isPending ? "opacity-50" : ""}`}>
                                    <TableCell>
                                        <div className="font-medium text-slate-800">{paciente.name}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500 font-mono">{maskCPF(paciente.cpf)}</TableCell>
                                    <TableCell className="text-sm">{maskPhone(paciente.phone)}</TableCell>
                                    <TableCell>
                                        <Badge variant={paciente.active ? "default" : "secondary"}
                                            className={paciente.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-200/50" : ""}>
                                            {paciente.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    setSelectedPatientForHistory(paciente);
                                                    setHistoryOpen(true);
                                                }}
                                                title="Histórico de Atendimento"
                                            >
                                                <FileText className="h-4 w-4 text-slate-500" />
                                            </Button>

                                            <Link href={`/admin/pacientes/${paciente.id}`} title="Acessar Prontuário">
                                                <Button variant="ghost" size="icon-sm" type="button">
                                                    <Pencil className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            </Link>

                                            <DeleteDialogGeneric
                                                id={paciente.id}
                                                onDelete={deletePaciente}
                                                onSuccess={() => fetchPacientes(filters)}
                                                title="Remover Paciente?"
                                                description={`Todos os prontuários e histórico clínico de ${paciente.name} serão excluídos permanentemente.`}
                                                successMessage="Paciente removido com sucesso!"
                                                errorMessage="Erro ao remover paciente."
                                            />
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
                            Mostrando <span className="font-medium">{(data.page - 1) * data.limit + 1}</span>–
                            <span className="font-medium">{Math.min(data.page * data.limit, data.total)}</span> de
                            <span className="font-medium"> {data.total}</span> pacientes
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchPacientes({ ...filters, page: data.page - 1 })} disabled={data.page === 1 || isPending}>
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <span className="text-sm font-medium">{data.page} / {data.totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => fetchPacientes({ ...filters, page: data.page + 1 })} disabled={data.page === data.totalPages || isPending}>
                                Próximo <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
