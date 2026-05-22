"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, Search, X, UserCheck, UserX, Loader2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientFound {
    id: string;
    name: string;
    cpf: string;
    phone: string;
}

function formatCPF(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const PROCEDURES = [
    "Consulta de Avaliação",
    "Profilaxia e Limpeza",
    "Implante Dentário",
    "Tratamento de Canal",
    "Extração Simples",
    "Extração de Siso",
    "Restauração",
    "Clareamento Dental",
    "Ortodontia",
    "Prótese Dentária",
    "Periodontia",
    "Cirurgia Oral",
    "Outro",
];

export function SidebarQuickSchedule() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"registered" | "guest">("registered");
    const [cpfInput, setCpfInput] = useState("");
    const [cpfSearching, setCpfSearching] = useState(false);
    const [patientFound, setPatientFound] = useState<PatientFound | null>(null);
    const [cpfError, setCpfError] = useState("");
    const [guestName, setGuestName] = useState("");
    const [procedure, setProcedure] = useState("");
    const [procedureOpen, setProcedureOpen] = useState(false);
    const [customProcedure, setCustomProcedure] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [time, setTime] = useState("09:00");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const procedureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (procedureRef.current && !procedureRef.current.contains(e.target as Node)) {
                setProcedureOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleReset = () => {
        setMode("registered");
        setCpfInput("");
        setCpfError("");
        setPatientFound(null);
        setGuestName("");
        setProcedure("");
        setCustomProcedure("");
        setDate(new Date().toISOString().split("T")[0]);
        setTime("09:00");
        setSuccess(false);
    };

    const handleCPFSearch = async () => {
        const raw = cpfInput.replace(/\D/g, "");
        if (raw.length !== 11) {
            setCpfError("CPF deve ter 11 dígitos");
            return;
        }
        setCpfSearching(true);
        setCpfError("");
        setPatientFound(null);
        try {
            const res = await fetch(`/api/admin/pacientes?cpf=${raw}&limit=1`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (data.pacientes && data.pacientes.length > 0) {
                const p = data.pacientes[0];
                setPatientFound({ id: p.id, name: p.name, cpf: p.cpf, phone: p.phone });
            } else {
                setCpfError("Paciente não encontrado. Use 'Sem Cadastro'.");
            }
        } catch {
            setCpfError("Erro ao buscar. Tente novamente.");
        } finally {
            setCpfSearching(false);
        }
    };

    const canSubmit =
        !!procedure &&
        (procedure !== "Outro" || !!customProcedure.trim()) &&
        (mode === "guest" ? !!guestName.trim() : !!patientFound);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);

        try {
            const finalProcedure = procedure === "Outro" ? customProcedure : procedure;
            const body = {
                ...(mode === "registered" && patientFound ? { patientId: patientFound.id } : { guestName }),
                scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
                serviceType: finalProcedure,
                estimatedValue: 0,
                status: "PENDENTE",
            };

            await fetch("/api/admin/agenda", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            setSuccess(true);
            setTimeout(() => {
                handleReset();
                setOpen(false);
            }, 1800);
        } catch {
            // silently handle
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-2 mb-1">
            {/* Trigger */}
            <button
                onClick={() => { setOpen((o) => !o); if (open) handleReset(); }}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                    open && "bg-blue-50 text-blue-700"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center",
                        open ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                    )}>
                        <CalendarDays size={18} strokeWidth={2.2} />
                    </div>
                    <span className={cn("font-medium text-[15px]", open && "font-semibold")}>Agendamento</span>
                </div>
                <ChevronRight className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    open ? "text-blue-400 rotate-90" : "text-slate-300 group-hover:text-slate-400"
                )} />
            </button>

            {/* Painel expansível */}
            {open && (
                <div className="mt-1 mx-1 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-white" />
                            <span className="text-xs font-bold text-white">Agendamento Rápido</span>
                        </div>
                        <button
                            onClick={() => { setOpen(false); handleReset(); }}
                            className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>

                    {success ? (
                        <div className="p-5 flex flex-col items-center gap-2 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-emerald-700">Consulta agendada!</p>
                            <p className="text-xs text-slate-500">Redirecionando...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Tipo Paciente */}
                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => { setMode("registered"); setPatientFound(null); setCpfError(""); setCpfInput(""); }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer",
                                        mode === "registered"
                                            ? "border-blue-400 bg-blue-50 text-blue-700"
                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                    Cadastrado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMode("guest"); setPatientFound(null); setCpfError(""); }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer",
                                        mode === "guest"
                                            ? "border-violet-400 bg-violet-50 text-violet-700"
                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    <UserX className="h-3.5 w-3.5 shrink-0" />
                                    Sem Cadastro
                                </button>
                            </div>

                            {/* Busca CPF */}
                            {mode === "registered" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Buscar por CPF
                                    </label>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={cpfInput}
                                            onChange={(e) => {
                                                setCpfInput(formatCPF(e.target.value));
                                                setCpfError("");
                                                setPatientFound(null);
                                            }}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCPFSearch())}
                                            placeholder="000.000.000-00"
                                            className="flex-1 h-8 px-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCPFSearch}
                                            disabled={cpfSearching}
                                            className="h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1"
                                        >
                                            {cpfSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                                        </button>
                                    </div>

                                    {cpfError && (
                                        <p className="mt-1.5 text-[10px] text-rose-500 font-semibold">{cpfError}</p>
                                    )}

                                    {patientFound && (
                                        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
                                                    <UserCheck className="h-3 w-3 text-white" />
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Paciente encontrado</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800">{patientFound.name}</p>
                                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">{patientFound.cpf}</p>
                                            {patientFound.phone && (
                                                <p className="text-[10px] text-slate-500 mt-0.5">{patientFound.phone}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nome Guest */}
                            {mode === "guest" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Nome do Paciente
                                    </label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Nome completo"
                                        className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            )}

                            {/* Procedimento */}
                            <div ref={procedureRef}>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Procedimento
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setProcedureOpen((o) => !o)}
                                        className={cn(
                                            "w-full h-8 px-2.5 flex items-center justify-between text-xs border rounded-lg transition-all cursor-pointer",
                                            procedure ? "text-slate-800 border-slate-300" : "text-slate-400 border-slate-200"
                                        )}
                                    >
                                        <span className="truncate">{procedure || "Selecione..."}</span>
                                        <ChevronDown className={cn("h-3 w-3 text-slate-400 shrink-0 transition-transform", procedureOpen && "rotate-180")} />
                                    </button>
                                    {procedureOpen && (
                                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                                            {PROCEDURES.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => { setProcedure(p); setProcedureOpen(false); }}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                        procedure === p ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 font-medium"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {procedure === "Outro" && (
                                    <input
                                        type="text"
                                        value={customProcedure}
                                        onChange={(e) => setCustomProcedure(e.target.value)}
                                        placeholder="Descreva o procedimento"
                                        className="mt-1.5 w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            {/* Data e Hora */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Horário</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        min="08:00"
                                        max="18:00"
                                        className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!canSubmit || submitting}
                                className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-3.5 w-3.5" />
                                        Agendar Consulta
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
