"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Search, AlertCircle, Info, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { maskCPF, rawCPF, maskCurrency, formatCurrency, rawCurrency } from "@/src/lib/masks";
import { ProcedureSelect } from "./procedure-select";
import { AddAppointmentDialogProps, Appointment, PatientFound } from "@/src/types/dashboard/agendamento";
import { TreatmentOption } from "@/src/types/dashboard/components";
import Link from "next/link";

export function AddAppointmentDialog({
    selectedDateStr,
    onDateChange,
    onAdd,
    appointments = [],
}: AddAppointmentDialogProps) {
    const [mode, setMode] = useState<"registered" | "guest">("registered");
    const [cpfInput, setCpfInput] = useState("");
    const [cpfSearching, setCpfSearching] = useState(false);
    const [patientFound, setPatientFound] = useState<PatientFound | null>(null);
    const [cpfError, setCpfError] = useState("");
    const [guestName, setGuestName] = useState("");
    const [procedure, setProcedure] = useState("");
    const [customProcedure, setCustomProcedure] = useState("");
    const [time, setTime] = useState("09:00");
    const [submitting, setSubmitting] = useState(false);

    const [billingType, setBillingType] = useState<string>("Particular");
    const [selectedTreatment, setSelectedTreatment] = useState<TreatmentOption | null>(null);
    const [estimatedValue, setEstimatedValue] = useState<string>("");
    const [isPriceManual, setIsPriceManual] = useState(false);

    const bookedTimes = appointments
        .filter((apt) => apt.date === selectedDateStr && apt.status !== "Cancelado")
        .map((apt) => apt.time)
        .sort();

    const isTimeBooked = bookedTimes.includes(time);

    useEffect(() => {
        if (selectedDateStr) {
            const defaultSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
            const firstAvailable = defaultSlots.find(slot => !bookedTimes.includes(slot));
            if (firstAvailable) {
                setTime(firstAvailable);
            } else {
                setTime("09:00");
            }
        }
    }, [selectedDateStr, appointments]);

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

    const handleCPFSearch = async () => {
        const raw = rawCPF(cpfInput);
        if (raw.length !== 11) {
            setCpfError("CPF deve ter 11 dígitos");
            return;
        }
        setCpfSearching(true);
        setCpfError("");
        setPatientFound(null);
        try {
            let res = await fetch(`/api/admin/pacientes?cpf=${raw}&limit=1`);
            let data = await res.json();

            if (!data.pacientes || data.pacientes.length === 0) {
                const formatted = maskCPF(raw);
                res = await fetch(`/api/admin/pacientes?cpf=${encodeURIComponent(formatted)}&limit=1`);
                data = await res.json();
            }

            if (data.pacientes && data.pacientes.length > 0) {
                const p = data.pacientes[0];
                setPatientFound({ id: p.id, name: p.name, cpf: p.cpf, phone: p.phone });
            } else {
                setCpfError("Paciente não encontrado. Use 'Sem Cadastro' para este agendamento.");
            }
        } catch {
            setCpfError("Erro de conexão. Tente novamente.");
        } finally {
            setCpfSearching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalProcedure = procedure === "Outro" ? customProcedure : procedure;
        if (!finalProcedure || !selectedDateStr) return;

        const isGuest = mode === "guest";
        const name = isGuest ? guestName : patientFound?.name;
        if (!name) return;

        const rawValue = rawCurrency(estimatedValue);

        setSubmitting(true);
        onAdd({
            patientName: name,
            date: selectedDateStr,
            time,
            procedure: finalProcedure,
            estimatedValue: rawValue,
            status: "Pendente",
            isNew: true,
            isGuest,
            billingType,
            ...(mode === "registered" && patientFound ? { patientId: patientFound.id } : {}),
        } as Omit<Appointment, "id">);
        setSubmitting(false);
    };

    return (
        <DialogContent className="sm:max-w-xl border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
            <div className="bg-blue-600 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-base font-black text-white">Novo Agendamento</DialogTitle>
                        <DialogDescription className="text-xs text-blue-100 font-semibold mt-0.5">
                            Marcar consulta para {selectedDateStr?.split("-").reverse().join("/")}
                        </DialogDescription>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        Identificação do Paciente
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => { setMode("registered"); setPatientFound(null); setCpfError(""); setCpfInput(""); }}
                            className={cn(
                                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer",
                                mode === "registered"
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                            )}
                        >
                            <UserCheck className="h-4 w-4" />
                            Paciente Cadastrado
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode("guest"); setPatientFound(null); setCpfError(""); setCpfInput(""); }}
                            className={cn(
                                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer",
                                mode === "guest"
                                    ? "border-violet-500 bg-violet-50 text-violet-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                            )}
                        >
                            <UserX className="h-4 w-4" />
                            Sem Cadastro
                        </button>
                    </div>
                </div>

                {mode === "registered" && (
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            CPF do Paciente
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={cpfInput}
                                onChange={(e) => {
                                    setCpfInput(maskCPF(e.target.value));
                                    setCpfError("");
                                    setPatientFound(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); handleCPFSearch(); }
                                }}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            />
                            <button
                                type="button"
                                onClick={handleCPFSearch}
                                disabled={cpfSearching}
                                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                            >
                                {cpfSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                                Buscar
                            </button>
                        </div>

                        {cpfError && (
                            <p className="mt-1.5 text-xs text-rose-500 font-bold flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {cpfError}
                            </p>
                        )}

                        {patientFound && (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white">
                                        <UserCheck className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                                        Paciente Confirmado
                                    </span>
                                </div>
                                <p className="text-xs font-black text-slate-800">{patientFound.name}</p>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5">CPF: {patientFound.cpf}</p>
                            </div>
                        )}
                    </div>
                )}

                {mode === "guest" && (
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Nome Completo <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Nome completo do paciente"
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-medium"
                            required
                        />
                        <p className="mt-1.5 text-[10px] text-violet-600 font-bold flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Agendamento rápido sem necessidade de cadastro prévio.
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Procedimento Clínico <span className="text-rose-500">*</span>
                    </label>
                    <ProcedureSelect
                        value={procedure}
                        onChange={setProcedure}
                        customValue={customProcedure}
                        onCustomChange={setCustomProcedure}
                        onSelectTreatment={setSelectedTreatment}
                    />

                    <div className="mt-1 flex items-center justify-between">
                        <Link
                            href="/admin/planos-tratamento"
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                        >
                            Editar procedimentos
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Tipo de Cobrança
                        </label>
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
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Valor Estimado (R$)
                        </label>
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Data
                        </label>
                        <input
                            type="date"
                            value={selectedDateStr || ""}
                            onChange={(e) => onDateChange(e.target.value)}
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

                {bookedTimes.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Horários Agendados neste Dia:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {bookedTimes.map((bt) => (
                                <span
                                    key={bt}
                                    className={cn(
                                        "text-[9px] font-bold px-2 py-0.5 rounded border transition-colors",
                                        time === bt
                                            ? "bg-rose-50 border-rose-200 text-rose-700"
                                            : "bg-slate-100 border-slate-200 text-slate-600"
                                    )}
                                >
                                    {bt}
                                </span>
                            ))}
                        </div>
                        {isTimeBooked && (
                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1 animate-pulse">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                Aviso: Horário já reservado (permitido somente para emergência).
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="flex-1 h-10 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                    </DialogClose>
                    <DialogClose asChild>
                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !procedure ||
                                (mode === "registered" && !patientFound) ||
                                (mode === "guest" && !guestName.trim())
                            }
                            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Confirmar Agendamento
                        </button>
                    </DialogClose>
                </div>
            </form>
        </DialogContent>
    );
}
