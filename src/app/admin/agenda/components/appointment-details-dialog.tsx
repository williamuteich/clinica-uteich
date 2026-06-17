"use client";

import { useState, useEffect } from "react";
import { Check, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { phoneToWhatsapp, maskPhone } from "@/src/lib/masks";
import { Appointment } from "@/src/types/dashboard/agendamento";
import { ProcedureSelect } from "./procedure-select";
import { TreatmentOption } from "@/src/types/dashboard/components";
import { CreatePatientLinkDialog } from "@/src/app/components/admin/create-dialog-link";

const STATUS_THEMES = {
    Confirmado: {
        gradient: "from-emerald-600 to-emerald-700",
    },
    Pendente: {
        gradient: "from-amber-500 to-orange-600",
    },
    Finalizado: {
        gradient: "from-indigo-600 to-indigo-800",
    },
    Cancelado: {
        gradient: "from-rose-500 to-rose-600",
    },
};

interface AppointmentDetailsDialogProps {
    appointment: Appointment;
    onStatusChange: (id: string | number, status: "Confirmado" | "Cancelado" | "Finalizado" | "Pendente") => void;
    onUpdate: (id: string | number, updatedFields: Partial<Appointment>) => void;
}

export function AppointmentDetailsDialog({
    appointment,
    onUpdate,
}: AppointmentDetailsDialogProps) {
    const [patientName, setPatientName] = useState(appointment.patientName);
    const [procedure, setProcedure] = useState(appointment.procedure);
    const [customProcedure, setCustomProcedure] = useState("");
    const [date, setDate] = useState(appointment.date);
    const [time, setTime] = useState(appointment.time);
    const [status, setStatus] = useState<"Confirmado" | "Pendente" | "Cancelado" | "Finalizado">(appointment.status);

    const [billingType, setBillingType] = useState<string>(appointment.billingType || "Particular");
    const [selectedTreatment, setSelectedTreatment] = useState<TreatmentOption | null>(null);
    const [estimatedValue, setEstimatedValue] = useState<number>(appointment.estimatedValue || 0);
    const [isPriceManual, setIsPriceManual] = useState(false);

    const theme = STATUS_THEMES[status] || STATUS_THEMES.Pendente;
    const phone = appointment.phone;
    const cleanedObs = appointment.description;

    useEffect(() => {
        setIsPriceManual(false);
    }, [procedure]);

    useEffect(() => {
        if (!isPriceManual && selectedTreatment) {
            const val = billingType === "Particular"
                ? selectedTreatment.valuePrivate ?? 0
                : selectedTreatment.valuePlan ?? 0;
            setEstimatedValue(val);
        }
    }, [billingType, selectedTreatment, isPriceManual]);

    const handleSave = () => {
        const finalProcedure = procedure === "Outro" ? customProcedure : procedure;
        if (!finalProcedure) {
            alert("O procedimento é obrigatório.");
            return;
        }

        onUpdate(appointment.id, {
            procedure: finalProcedure,
            date,
            time,
            status,
            isGuest: appointment.isGuest,
            patientName: appointment.isGuest ? patientName : appointment.patientName,
            billingType,
            estimatedValue,
        });
    };

    return (
        <DialogContent className="sm:max-w-xl border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
            <div className="bg-white">
                <div className={cn("px-6 py-6 text-white bg-linear-to-r transition-all duration-300", theme.gradient)}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-white">
                                    Detalhes do Agendamento
                                </DialogTitle>
                                <p className="text-xs text-white/95 font-medium">
                                    Altere as informações diretamente e clique em salvar
                                </p>
                            </div>
                        </div>

                        <span className={cn(
                            "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/30 bg-white/20 text-white select-none shrink-0"
                        )}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Paciente
                            </label>
                            {appointment.isGuest ? (
                                <input
                                    type="text"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    className="w-full h-10 px-3 text-xs border border-slate-200 bg-white text-slate-800 rounded-lg outline-none font-bold focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="relative flex items-center w-full">
                                    <input
                                        type="text"
                                        value={appointment.patientName}
                                        readOnly
                                        className="w-full h-10 pl-3 pr-24 text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-lg outline-none font-bold truncate cursor-not-allowed"
                                    />
                                    <span className="absolute right-2.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase tracking-wider">
                                        Cadastrado
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Tipo Cadastro
                            </label>
                            <div className="w-full flex items-center h-10 px-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-lg font-bold text-xs select-none">
                                {appointment.isGuest ? "Sem Cadastro (Guest)" : "Paciente Cadastrado"}
                            </div>
                            {appointment.isGuest && (
                                <div className="mt-1 flex justify-end">
                                    <CreatePatientLinkDialog
                                        asLink
                                        defaultPatientName={patientName}
                                        defaultPatientPhone={appointment.guestPhone || appointment.phone || ""}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Procedimento Clínico
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

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Tipo de Cobrança
                            </label>
                            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setBillingType("Particular")}
                                    className={cn(
                                        "flex items-center justify-center py-2 rounded-md text-[10px] font-black transition-all cursor-pointer",
                                        billingType === "Particular"
                                            ? "bg-white text-emerald-600 shadow-3xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    Particular
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingType("Plano")}
                                    className={cn(
                                        "flex items-center justify-center py-2 rounded-md text-[10px] font-black transition-all cursor-pointer",
                                        billingType === "Plano"
                                            ? "bg-white text-blue-600 shadow-3xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    Plano
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Valor Estimado (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={estimatedValue === 0 ? "" : estimatedValue}
                                onChange={(e) => {
                                    setEstimatedValue(parseFloat(e.target.value) || 0);
                                    setIsPriceManual(true);
                                }}
                                placeholder="0.00"
                                className="w-full h-10 px-3 text-xs border border-slate-202 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Data
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-10 px-3 text-xs border border-slate-200 bg-white text-slate-800 rounded-lg outline-none font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                Horário
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-10 px-3 text-xs border border-slate-200 bg-white text-slate-800 rounded-lg outline-none font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            />
                        </div>

                        {phone && (
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Telefone / WhatsApp
                                </label>
                                <a
                                    href={`https://api.whatsapp.com/send/?phone=${phoneToWhatsapp(phone)}&text=${encodeURIComponent(
                                        `Olá ${appointment.patientName}, tudo bem? Sou o Dr. Lenon, da Uteich Odontologia. Estou entrando em contato para confirmar seu agendamento de ${appointment.procedure} no dia ${appointment.date.split("-").reverse().join("/")} às ${appointment.time}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-between h-10 px-3 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg outline-none font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer group"
                                >
                                    <span>{maskPhone(phone)}</span>
                                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                                        WhatsApp
                                    </span>
                                </a>
                            </div>
                        )}

                        {cleanedObs && (
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Observações
                                </label>
                                <textarea
                                    readOnly
                                    value={cleanedObs}
                                    rows={3}
                                    className="w-full p-3 text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-lg outline-none font-semibold resize-none leading-relaxed cursor-not-allowed"
                                />
                            </div>
                        )}

                        <div className="col-span-2 space-y-1.5 mt-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                Alterar Status da Consulta
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStatus("Confirmado")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[9px] font-black transition-all cursor-pointer uppercase tracking-wider",
                                        status === "Confirmado"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xs"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700"
                                    )}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Confirmar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus("Finalizado")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[9px] font-black transition-all cursor-pointer uppercase tracking-wider",
                                        status === "Finalizado"
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-2xs"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
                                    )}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Finalizar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus("Pendente")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[9px] font-black transition-all cursor-pointer uppercase tracking-wider",
                                        status === "Pendente"
                                            ? "border-amber-500 bg-amber-50 text-amber-700 shadow-2xs"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:bg-amber-50/50 hover:text-amber-700"
                                    )}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Pendente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus("Cancelado")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[9px] font-black transition-all cursor-pointer uppercase tracking-wider",
                                        status === "Cancelado"
                                            ? "border-rose-500 bg-rose-50 text-rose-700 shadow-2xs"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-700"
                                    )}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        {appointment.patientId && !appointment.isGuest && (
                            <div className="col-span-2 mt-1">
                                <Link
                                    target="_blank"
                                    href={`/admin/pacientes/${appointment.patientId}`}
                                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer text-center"
                                >
                                    Abrir Prontuário
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="h-10 px-4 border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                            >
                                Fechar
                            </button>
                        </DialogClose>
                        <DialogClose asChild>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                            >
                                <Check className="h-3.5 w-3.5" />
                                Salvar
                            </button>
                        </DialogClose>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}
