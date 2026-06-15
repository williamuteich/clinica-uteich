"use client";

import { Check, Pencil, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { phoneToWhatsapp } from "@/src/lib/masks";
import { Appointment } from "@/src/types/dashboard/agendamento";

const STATUS_THEMES = {
    Confirmado: {
        gradient: "from-emerald-600 to-emerald-700",
    },
    Pendente: {
        gradient: "from-amber-500 to-orange-600",
    },
    Finalizado: {
        gradient: "from-indigo-600 to-indigo-750",
    },
    Cancelado: {
        gradient: "from-rose-500 to-rose-600",
    },
};

function extractPhone(desc?: string | null): string | null {
    if (!desc) return null;
    const match = desc.match(/(?:Telefone\/WhatsApp:\s*|WhatsApp:\s*|Telefone:\s*)([^\n]+)/i);
    if (match?.[1]) return match[1].trim();
    const numbersMatch = desc.match(/(?:\(?\d{2}\)?\s*?\d{4,5}-?\d{4})/);
    if (numbersMatch) return numbersMatch[0].trim();
    return null;
}

function cleanDescription(desc?: string | null): string {
    if (!desc) return "";
    return desc
        .split("\n")
        .filter(line => {
            const l = line.toLowerCase();
            return !l.includes("agendado pelo site") &&
                   !l.includes("telefone/whatsapp") &&
                   !l.includes("whatsapp:") &&
                   !l.includes("telefone:") &&
                   !l.includes("status cadastro");
        })
        .map(line => line.replace(/^observação:\s*/i, ""))
        .join("\n")
        .trim();
}

interface AppointmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    appointment: Appointment | null;
    onStatusChange: (id: string | number, status: "Confirmado" | "Cancelado") => void;
    onEditClick: (apt: Appointment) => void;
}

export function AppointmentDetailsDialog({
    open,
    onOpenChange,
    appointment,
    onStatusChange,
    onEditClick,
}: AppointmentDetailsDialogProps) {
    if (!appointment) return null;

    const theme = STATUS_THEMES[appointment.status] || STATUS_THEMES.Pendente;
    const phone = extractPhone(appointment.description);
    const cleanedObs = cleanDescription(appointment.description);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
                <div className="bg-white">
                    <div className={cn("px-6 py-6 text-white bg-linear-to-r", theme.gradient)}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-white">
                                    Detalhes do Agendamento
                                </DialogTitle>
                                <p className="text-xs text-white/90 font-medium">Informações gerais e controle clínico</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Paciente
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={appointment.patientName}
                                        readOnly
                                        className="w-full h-10 pl-3 pr-24 text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl outline-none font-bold truncate"
                                    />
                                    {appointment.isGuest && (
                                        <span className="absolute right-2.5 px-2 py-0.5 bg-violet-100 text-violet-750 text-[8px] font-black rounded uppercase tracking-wider">
                                            Sem Cadastro
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <div className={cn(
                                    "w-full flex items-center h-10 px-3 border rounded-xl font-bold text-[10px] uppercase tracking-wider",
                                    appointment.status === "Confirmado" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                                    appointment.status === "Pendente" && "border-amber-250 bg-amber-50 text-amber-800",
                                    appointment.status === "Finalizado" && "border-indigo-250 bg-indigo-50 text-indigo-805",
                                    appointment.status === "Cancelado" && "border-rose-250 bg-rose-50 text-rose-800"
                                )}>
                                    <span className={cn(
                                        "w-2 h-2 rounded-full mr-2 shrink-0",
                                        appointment.status === "Confirmado" && "bg-emerald-500",
                                        appointment.status === "Pendente" && "bg-amber-500",
                                        appointment.status === "Finalizado" && "bg-indigo-500",
                                        appointment.status === "Cancelado" && "bg-rose-500"
                                    )} />
                                    {appointment.status}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Procedimento Clínico
                                </label>
                                <input
                                    type="text"
                                    value={appointment.procedure}
                                    readOnly
                                    className="w-full h-10 px-3 text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl outline-none font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Data & Horário
                                </label>
                                <input
                                    type="text"
                                    value={`${appointment.date.split("-").reverse().join("/")} às ${appointment.time}`}
                                    readOnly
                                    className="w-full h-10 px-3 text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl outline-none font-bold"
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
                                        className="w-full flex items-center justify-between h-10 px-3 border border-emerald-250 bg-emerald-50 text-emerald-800 rounded-xl outline-none font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer group"
                                    >
                                        <span>{phone}</span>
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
                                        className="w-full p-3 text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl outline-none font-semibold resize-none leading-relaxed"
                                    />
                                </div>
                            )}

                            {appointment.patientId && !appointment.isGuest && (
                                <div className="col-span-2 mt-1">
                                    <Link
                                        href={`/admin/pacientes/${appointment.patientId}`}
                                        className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-blue-750 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer text-center"
                                    >
                                        Abrir Prontuário
                                    </Link>
                                </div>
                            )}
                        </div>

                        {appointment.status === "Pendente" && (
                            <div className="pt-2 flex gap-2">
                                <button
                                    onClick={() => {
                                        onStatusChange(appointment.id, "Confirmado");
                                        onOpenChange(false);
                                    }}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                                >
                                    <Check className="h-4 w-4" />
                                    Confirmar Agendamento
                                </button>
                                <button
                                    onClick={() => {
                                        onStatusChange(appointment.id, "Cancelado");
                                        onOpenChange(false);
                                    }}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Cancelar
                                </button>
                            </div>
                        )}
                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => onOpenChange(false)}
                                className="h-10 px-4 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                            >
                                Fechar
                            </button>
                            <button
                                className="inline-flex items-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onEditClick(appointment);
                                }}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
