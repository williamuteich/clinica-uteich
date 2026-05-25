"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProcedureSelect, PROCEDURES } from "./procedure-select";
import type { Appointment } from "./calendar-grid";

interface EditAppointmentDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    appointment: Appointment | null;
    onUpdate: (id: string | number, updatedFields: Partial<Appointment>) => void;
}

const STATUS_OPTIONS = ["Pendente", "Confirmado", "Cancelado"] as const;

export function EditAppointmentDialog({
    open,
    onOpenChange,
    appointment,
    onUpdate,
}: EditAppointmentDialogProps) {
    const [procedure, setProcedure] = useState("");
    const [customProcedure, setCustomProcedure] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [status, setStatus] = useState<"Confirmado" | "Pendente" | "Cancelado">("Pendente");

    const handleOpenChange = (v: boolean) => {
        if (v && appointment) {
            setProcedure(PROCEDURES.includes(appointment.procedure as any) ? appointment.procedure : "Outro");
            setCustomProcedure(PROCEDURES.includes(appointment.procedure as any) ? "" : appointment.procedure);
            setEstimatedValue(String(appointment.estimatedValue ?? 0));
            setDate(appointment.date);
            setTime(appointment.time);
            setStatus(appointment.status);
        }
        onOpenChange(v);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment) return;
        const finalProcedure = procedure === "Outro" ? customProcedure : procedure;
        if (!finalProcedure) return;

        const parsedValue = Number(estimatedValue);
        if (Number.isNaN(parsedValue) || parsedValue < 0) return;

        onUpdate(appointment.id, {
            procedure: finalProcedure,
            estimatedValue: parsedValue,
            date,
            time,
            status,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
                <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Pencil className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-black text-white">Editar Agendamento</DialogTitle>
                            <DialogDescription className="text-xs text-blue-100 font-semibold mt-0.5">
                                Alterar dados da consulta de {appointment?.patientName}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                            Status do Agendamento
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map((statusOption) => (
                                <button
                                    key={statusOption}
                                    type="button"
                                    onClick={() => setStatus(statusOption)}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border-2 text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider",
                                        status === statusOption
                                            ? statusOption === "Confirmado"
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                : statusOption === "Cancelado"
                                                    ? "border-rose-500 bg-rose-50 text-rose-700"
                                                    : "border-amber-500 bg-amber-50 text-amber-705"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-2 h-2 rounded-full",
                                            statusOption === "Confirmado" && "bg-emerald-500",
                                            statusOption === "Cancelado" && "bg-rose-500",
                                            statusOption === "Pendente" && "bg-amber-500"
                                        )}
                                    />
                                    {statusOption}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Procedimento Clínico <span className="text-rose-500">*</span>
                        </label>
                        <ProcedureSelect
                            value={procedure}
                            onChange={setProcedure}
                            customValue={customProcedure}
                            onCustomChange={setCustomProcedure}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Valor Estimado <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={estimatedValue}
                            onChange={(e) => setEstimatedValue(e.target.value)}
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                Data
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                Horário
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-10 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!procedure}
                            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                            <Check className="h-4 w-4" />
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
