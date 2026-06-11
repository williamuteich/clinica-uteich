"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, ClipboardList, Clock, Pencil, Activity, Plus, Trash2 } from "lucide-react";
import { EvolucaoItemProps, HistoricoPatient } from "@/src/types/dashboard/pacientes";
import { DeleteDialogGeneric } from "@/src/app/components/delete-dialog-generic";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createHistoricoPaciente, deleteHistoricoPaciente, updateHistoricoPaciente } from "@/src/services/historico";

function EvolucaoItem({ evolucao, onUpdate, onDelete }: EvolucaoItemProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [description, setDescription] = useState(evolucao.description);
    const [isPending, setIsPending] = useState(false);
    const apiUrl = `/api/admin/pacientes/${evolucao.patientId}/historico`;

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (description.trim().length < 3) {
            toast.warning("A evolução clínica deve conter pelo menos 3 caracteres.");
            return;
        }

        setIsPending(true);
        try {
            const res = await updateHistoricoPaciente(evolucao.patientId, evolucao.id, description);
            if (res.success) {
                toast.success("Evolução clínica atualizada com sucesso!");
                setEditOpen(false);
                onUpdate(evolucao.id, description);
            } else {
                toast.error(res.error || "Erro ao salvar alterações.");
            }
        } catch (err) {
            toast.error("Erro interno do servidor ao salvar.");
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteHistoricoPaciente(evolucao.patientId, id);
            return { success: res.success, error: res.error };
        } catch (err) {
            return { success: false, error: "Erro interno ao processar a exclusão." };
        }
    };

    return (
        <div className="relative animate-in fade-in duration-500">
            <div className="absolute -left-[32px] top-1.5 w-4 h-4 rounded-full bg-blue-50 border-2 border-blue-600 shadow-sm flex items-center justify-center ring-4 ring-white">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>

            <div className="bg-slate-50/40 hover:bg-white border hover:border-slate-200 rounded-lg p-3 transition-all duration-300 shadow-sm hover:shadow-slate-100/50 flex gap-4 items-start justify-between group">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                            {new Date(evolucao.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-400">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(evolucao.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal font-medium whitespace-pre-wrap">
                        {evolucao.description}
                    </p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all duration-300 shrink-0">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger render={
                            <button
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title="Editar relato clínico"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        } />
                        <DialogContent className="sm:max-w-lg">
                            <form onSubmit={handleEditSubmit}>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        Editar Registro Clínico
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-400 mt-1">
                                        Atualize as informações de evolução clínica do paciente.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`editDesc-${evolucao.id}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Evolução Clínica / Relato
                                        </Label>
                                        <textarea
                                            id={`editDesc-${evolucao.id}`}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Descreva aqui o relato clínico..."
                                            rows={6}
                                            className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                                            required
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="bg-slate-50/55 -mx-6 -mb-6 p-5 border-t flex justify-end gap-3 rounded-b-lg">
                                    <DialogClose render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-9 text-xs cursor-pointer"
                                        >
                                            Cancelar
                                        </Button>
                                    } />
                                    <Button
                                        type="submit"
                                        disabled={isPending}
                                        className="bg-blue-600 hover:bg-blue-700 h-9 text-xs text-white font-bold cursor-pointer"
                                    >
                                        {isPending ? "Salvando..." : "Salvar Alterações"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <DeleteDialogGeneric
                        id={evolucao.id}
                        onDelete={handleDelete}
                        onSuccess={() => onDelete(evolucao.id)}
                        title="Confirmar Exclusão"
                        description="Esta ação é irreversível e removerá permanentemente o relato da linha do tempo do paciente."
                        successMessage="Registro clínico excluído com sucesso!"
                        errorMessage="Erro ao excluir registro."
                        triggerButton={
                            <button
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Excluir relato clínico"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

type EvolucaoListClientProps = {
    initialItems: HistoricoPatient[];
    patientId: string;
};

export default function EvolucaoListClient({ initialItems, patientId }: EvolucaoListClientProps) {
    const router = useRouter();
    const [items, setItems] = useState<HistoricoPatient[]>(initialItems);
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const [createOpen, setCreateOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const apiUrl = `/api/admin/pacientes/${patientId}/historico`;

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const description = formData.get("description") as string;

        if (description.trim().length < 3) {
            toast.warning("A evolução clínica deve conter pelo menos 3 caracteres.");
            return;
        }

        setIsPending(true);
        try {
            const res = await createHistoricoPaciente(patientId, description);
            if (res.success && res.data) {
                toast.success("Evolução clínica criada com sucesso!");
                setCreateOpen(false);
                setItems(prev => [res.data, ...prev]);
                form.reset();
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao criar evolução.");
            }
        } catch (err) {
            console.error("Erro ao criar evolução:", err);
            toast.error("Erro interno do servidor ao salvar.");
        } finally {
            setIsPending(false);
        }
    };

    const handleUpdateItem = (id: string, description: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, description } : item));
        router.refresh();
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        router.refresh();
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex flex-row items-center justify-between border-b pb-4 gap-4">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Evolução Clínica & Procedimentos
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Histórico detalhado de evoluções, queixas e tratamentos realizados ao longo do tempo.
                    </p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger render={
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-md shrink-0 flex items-center gap-2 shadow-xs text-xs font-semibold cursor-pointer">
                            <Plus className="h-4 w-4" /> Nova Evolução
                        </Button>
                    } />
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleCreateSubmit}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    Nova Evolução Clínica
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400 mt-1">
                                    Registre as informações de evolução clínica, queixas e procedimentos do paciente.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Evolução Clínica / Relato
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Descreva aqui o diagnóstico, profilaxia, queixa do paciente ou procedimentos executados..."
                                        rows={6}
                                        className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className="bg-slate-50/55 -mx-6 -mb-6 p-5 border-t flex justify-end gap-3 rounded-b-lg">
                                <DialogClose render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 text-xs cursor-pointer"
                                    >
                                        Cancelar
                                    </Button>
                                } />
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-blue-600 hover:bg-blue-700 h-9 text-xs text-white font-bold cursor-pointer"
                                >
                                    {isPending ? "Criando..." : "Criar Registro"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="pt-2">
                {items.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-6">
                        <ClipboardList className="h-10 w-10 text-slate-350 mb-3" />
                        <h4 className="text-sm font-semibold text-slate-700">Nenhum Registro Clínico</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                            Nenhuma evolução ou histórico de consulta foi adicionado a este prontuário ainda.
                        </p>
                    </div>
                ) : (
                    <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-4 pt-2">
                        {items.map((evolucao) => (
                            <EvolucaoItem
                                key={evolucao.id}
                                evolucao={evolucao}
                                onUpdate={handleUpdateItem}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}