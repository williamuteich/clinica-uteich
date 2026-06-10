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
        pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
        gradient: "from-emerald-600 to-emerald-700",
    },
    Pendente: {
        pill: "bg-amber-100 text-amber-800 border-amber-250",
        gradient: "from-amber-500 to-orange-600",
    },
    Cancelado: {
        pill: "bg-rose-100 text-rose-800 border-rose-200",
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden shadow-2xl rounded-2xl">
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
                                <p className="text-xs text-white/90">Gestão clínica e controle</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paciente</span>
                                <p className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1.5">
                                    {appointment.patientName}
                                    {appointment.isGuest && (
                                        <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[8px] font-bold rounded">
                                            Sem Cadastro
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Status da Consulta
                                </span>
                                <div className="mt-1">
                                    <span
                                        className={cn(
                                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block",
                                            theme.pill
                                        )}
                                    >
                                        {appointment.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procedimento</span>
                                <p className="text-xs font-bold text-slate-850 mt-1">{appointment.procedure}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Estimado</span>
                                <p className="text-xs font-bold text-slate-850 mt-1">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                                        appointment.estimatedValue || 0
                                    )}
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data & Horário</span>
                                <p className="text-xs font-bold text-slate-850 mt-1">
                                    {appointment.date.split("-").reverse().join("/")} às{" "}
                                    <span className="text-blue-600 font-black">{appointment.time}</span>
                                </p>
                            </div>

                            {appointment.description && (
                                <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Observações / Telefone
                                    </span>
                                    <p className="text-xs font-medium text-slate-705 mt-1 whitespace-pre-wrap leading-relaxed">
                                        {appointment.description}
                                    </p>
                                </div>
                            )}
                            {phone && (
                                <div className="col-span-2">
                                    <a
                                        href={`https://api.whatsapp.com/send/?phone=${phoneToWhatsapp(phone)}&text=${encodeURIComponent(
                                            `Olá ${appointment.patientName}, tudo bem? Sou o Dr. Lenon, da Uteich Odontologia. Estou entrando em contato para confirmar seu agendamento de ${appointment.procedure} no dia ${appointment.date.split("-").reverse().join("/")} às ${appointment.time}.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                                        Conversar no WhatsApp
                                    </a>
                                </div>
                            )}
                            {appointment.patientId && !appointment.isGuest && (
                                <div className="col-span-2">
                                    <Link
                                        href={`/admin/pacientes/${appointment.patientId}`}
                                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                        Abrir prontuário
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
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                                >
                                    <Check className="h-4 w-4" />
                                    Confirmar Agendamento
                                </button>
                                <button
                                    onClick={() => {
                                        onStatusChange(appointment.id, "Cancelado");
                                        onOpenChange(false);
                                    }}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
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
