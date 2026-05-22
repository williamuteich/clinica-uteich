"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { CalendarDays, Loader2 } from "lucide-react";
import { PacienteHistoricoDialogProps, HistoricoPatient } from "@/src/types/dashboard/pacientes";
import { getHistoricoPaciente } from "@/src/services/pacientes";

export function PacienteHistoricoDialog({ paciente, open, onOpenChange }: PacienteHistoricoDialogProps) {
    const [history, setHistory] = useState<HistoricoPatient[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && paciente?.id) {
            setLoading(true);
            getHistoricoPaciente(paciente.id)
                .then((data) => {
                    setHistory(data || []);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, paciente?.id]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-800 font-semibold">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        Histórico de Atendimento
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                        Histórico de consultas e procedimentos realizados para <strong>{paciente?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-xs font-semibold">Carregando histórico...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs text-center leading-relaxed font-semibold">
                            Nenhum relato clínico ou procedimento registrado para este paciente.
                        </div>
                    ) : (
                        <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-2">
                            {history.map((item) => (
                                <div key={item.id} className="relative">
                                    <span className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50 border border-white" />
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">Registro Clínico / Evolução</p>
                                            <p className="text-xs text-muted-foreground">Uteich Odontologia</p>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 whitespace-nowrap">
                                            {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-650 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100/80 font-medium">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-9 text-xs font-semibold cursor-pointer">
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
