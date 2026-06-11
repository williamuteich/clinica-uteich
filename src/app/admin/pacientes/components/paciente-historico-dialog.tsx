"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { CalendarDays, Loader2, FileText } from "lucide-react";
import { getHistoricoPaciente } from "@/src/services/historico";
import { HistoricoPatient } from "@/src/types/dashboard/pacientes";

interface PacienteHistoricoDialogProps {
    pacienteId: string;
    pacienteName: string;
}

export const PacienteHistoricoDialog = memo(function PacienteHistoricoDialog({
    pacienteId,
    pacienteName
}: PacienteHistoricoDialogProps) {
    const [history, setHistory] = useState<HistoricoPatient[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!pacienteId) return;
        setLoading(true);
        try {
            const data = await getHistoricoPaciente(pacienteId);
            setHistory(data || []);
        } catch (err) {
            console.error("Erro ao buscar histórico:", err);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [pacienteId]);

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open, fetchHistory]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setHistory([]);
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" type="button" title="Histórico de Atendimento">
                    <FileText className="h-4 w-4 text-slate-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0">
                <DialogHeader className="px-5 pt-5 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                        Histórico
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        {pacienteName}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-xs text-slate-500">Carregando...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
                            Nenhum registro encontrado.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="relative pl-4 border-l-2 border-blue-200">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wide">
                                            Evolução
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});