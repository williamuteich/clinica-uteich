"use client";

import { useState, useTransition, useRef } from "react";
import { DialogContent, DialogDescription, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Appointment, CreateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { toast } from "react-toastify";
import { AgendamentoCreateModalProps } from "@/src/types/dashboard/components";
import { createAgendamento } from "@/src/services/agendamento";
import { ProcedureSelect } from "@/src/app/admin/agenda/components/procedure-select";

export default function AgendamentoCreateModal({ patientId, onCreated }: AgendamentoCreateModalProps) {
    const [isPending, startTransition] = useTransition();
    const [scheduledAt, setScheduledAt] = useState("");
    const [procedure, setProcedure] = useState("");
    const [customProcedure, setCustomProcedure] = useState("");
    const [status, setStatus] = useState<CreateAgendamentoInput["status"]>("PENDING");
    const closeRef = useRef<HTMLButtonElement>(null);

    const resetForm = () => {
        setScheduledAt("");
        setProcedure("");
        setCustomProcedure("");
        setStatus("PENDING");
    };

    const handleSubmit = () => {
        const serviceType = procedure === "Outro" ? customProcedure : procedure;
        if (!scheduledAt || !serviceType) {
            toast.error("Preencha a data/hora e o procedimento clínico.");
            return;
        }

        const payload: CreateAgendamentoInput = {
            patientId,
            scheduledAt,
            serviceType,
            estimatedValue: 0,
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
            closeRef.current?.click();
            toast.success("Agendamento criado com sucesso!");
        });
    };

    return (
        <DialogContent className="sm:max-w-xl border-none p-0 overflow-hidden shadow-2xl rounded-2xl bg-white">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
                <DialogTitle className="text-base font-black text-slate-900">Novo Agendamento</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                    Registre uma nova consulta para este paciente.
                </DialogDescription>
            </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Procedimento Clínico</label>
                            <ProcedureSelect
                                value={procedure}
                                onChange={setProcedure}
                                customValue={customProcedure}
                                onCustomChange={setCustomProcedure}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Data e Hora</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as CreateAgendamentoInput["status"])}
                                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                                >
                                    <option value="PENDING">Pendente</option>
                                    <option value="CONFIRMED">Confirmado</option>
                                    <option value="CANCELLED">Cancelado</option>
                                    <option value="COMPLETED">Realizado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <DialogClose ref={closeRef} className="hidden" />
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="h-10 rounded-xl border-slate-200 px-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                            >
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isPending} 
                            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
    );
}
