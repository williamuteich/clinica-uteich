"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { DialogContent, DialogDescription, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Appointment, CreateAgendamentoInput } from "@/src/types/dashboard/pacientes";
import { toast } from "react-toastify";
import { AgendamentoCreateModalProps, TreatmentOption } from "@/src/types/dashboard/components";
import { createAgendamento } from "@/src/services/agendamento";
import { ProcedureSelect } from "@/src/app/admin/agenda/components/procedure-select";
import { cn } from "@/lib/utils";
import { maskCurrency, formatCurrency, rawCurrency } from "@/src/lib/masks";

export default function AgendamentoCreateModal({ patientId, onCreated }: AgendamentoCreateModalProps) {
    const [isPending, startTransition] = useTransition();
    const [scheduledAt, setScheduledAt] = useState("");
    const [procedure, setProcedure] = useState("");
    const [customProcedure, setCustomProcedure] = useState("");
    const [status, setStatus] = useState<CreateAgendamentoInput["status"]>("PENDING");
    const [billingType, setBillingType] = useState<string>("Particular");
    const [selectedTreatment, setSelectedTreatment] = useState<TreatmentOption | null>(null);
    const [estimatedValue, setEstimatedValue] = useState<string>("");
    const [isPriceManual, setIsPriceManual] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    const resetForm = () => {
        setScheduledAt("");
        setProcedure("");
        setCustomProcedure("");
        setStatus("PENDING");
        setBillingType("Particular");
        setSelectedTreatment(null);
        setEstimatedValue("");
        setIsPriceManual(false);
    };

    useEffect(() => {
        setIsPriceManual(false);
    }, [procedure]);

    useEffect(() => {
        if (!isPriceManual) {
            if (selectedTreatment) {
                const val = billingType === "Particular"
                    ? selectedTreatment.valuePrivate ?? 0
                    : selectedTreatment.valuePlan ?? 0;
                setEstimatedValue(val > 0 ? formatCurrency(val) : "");
            } else {
                setEstimatedValue("");
            }
        }
    }, [billingType, selectedTreatment, isPriceManual]);

    const handleSubmit = () => {
        const serviceType = procedure === "Outro" ? customProcedure : procedure;
        if (!scheduledAt || !serviceType) {
            toast.error("Preencha a data/hora e o procedimento clínico.");
            return;
        }

        const rawValue = rawCurrency(estimatedValue);

        const payload: CreateAgendamentoInput = {
            patientId,
            scheduledAt,
            serviceType,
            estimatedValue: rawValue,
            status,
            billingType,
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
                            onSelectTreatment={setSelectedTreatment}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Tipo de Cobrança</label>
                            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setBillingType("Particular")}
                                    className={cn(
                                        "flex items-center justify-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                                        billingType === "Particular"
                                            ? "bg-white text-emerald-600 shadow-2xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    Particular
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingType("Plano")}
                                    className={cn(
                                        "flex items-center justify-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                                        billingType === "Plano"
                                            ? "bg-white text-blue-600 shadow-2xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    Plano
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Valor Estimado (R$)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={estimatedValue}
                                onChange={(e) => {
                                    setEstimatedValue(maskCurrency(e.target.value));
                                    setIsPriceManual(true);
                                }}
                                placeholder="0,00"
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 bg-white"
                            />
                        </div>
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
