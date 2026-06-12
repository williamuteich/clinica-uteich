"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Appointment, CreateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { toast } from "react-toastify";
import { AgendamentoCreateModalProps } from "@/src/types/dashboard/components";
import { createAgendamento } from "@/src/services/agendamento";

export default function AgendamentoCreateModal({ patientId, open, onOpenChange, onCreated }: AgendamentoCreateModalProps) {
    const [isPending, startTransition] = useTransition();
    const [scheduledAt, setScheduledAt] = useState("");
    const [serviceType, setServiceType] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [status, setStatus] = useState<CreateAgendamentoInput["status"]>("PENDING");

    const resetForm = () => {
        setScheduledAt("");
        setServiceType("");
        setEstimatedValue("");
        setStatus("PENDING");
    };

    const handleSubmit = () => {
        if (!scheduledAt || !serviceType || estimatedValue === "") {
            toast.error("Preencha data/hora, tipo de serviço e valor estimado.");
            return;
        }

        const payload: CreateAgendamentoInput = {
            patientId,
            scheduledAt,
            serviceType,
            estimatedValue: Number(estimatedValue),
            status,
        };

        startTransition(async () => {
            const res = await createAgendamento(payload);
            if (!res.success || !res.data) {
                toast.error(res.error || "Erro ao criar agendamento.");
                return;
            }

            onCreated(res.data);
            resetForm();
            onOpenChange(false);
            toast.success("Agendamento criado com sucesso!");
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl border-none p-0 overflow-hidden shadow-2xl rounded-2xl bg-white">
                <div className="border-b border-slate-200 bg-white px-6 py-5">
                    <DialogTitle className="text-base font-black text-slate-900">Novo Agendamento</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-1">
                        Registre uma nova consulta para este paciente.
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Data e Hora</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Tipo de Serviço</label>
                            <input
                                type="text"
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                placeholder="Ex: Limpeza e profilaxia"
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Valor Estimado</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={estimatedValue}
                                onChange={(e) => setEstimatedValue(e.target.value)}
                                placeholder="Ex: 250"
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as CreateAgendamentoInput["status"])}
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="PENDING">Pendente</option>
                                <option value="CONFIRMED">Confirmado</option>
                                <option value="CANCELLED">Cancelado</option>
                                <option value="COMPLETED">Realizado</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            className="rounded-xl border-slate-200"
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={isPending} className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Agendamento"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
