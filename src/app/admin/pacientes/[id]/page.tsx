import Link from "next/link";
import { getPaciente } from "@/src/services/pacientes";
import { getOdontogramaPaciente } from "@/src/services/odontograma";
import { getHistoricoPaciente } from "@/src/services/historico";
import { getAgendamentos } from "@/src/services/agendamento";
import OdontogramaTab from "./nav-links/odontograma/odontograma-tab";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
    Plus,
    Calendar,
    User,
    MessageCircle,
    FileText,
} from "lucide-react";

import { PatientPageProps } from "@/src/types/dashboard/pacientes";
import { TasksModal } from "./components/tasks-modal";
import { maskCPF, maskPhone } from "@/src/lib/masks";
import { PatientAppointmentsSection } from "./components/patient-appointments-section";


export default async function PatientOverviewPage({ params }: PatientPageProps) {
    const { id } = await params;

    const [paciente, odontogram, historico, agendamentosRes] = await Promise.all([
        getPaciente(id),
        getOdontogramaPaciente(id),
        getHistoricoPaciente(id),
        getAgendamentos({ patientId: id, page: 1, limit: 100 }),
    ]);

    if (!paciente) return null;

    const appointments = agendamentosRes?.agendamentos ?? [];
    const latestEvolutions = historico?.slice(0, 3) ?? [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full animate-in fade-in duration-500">
            <div className="lg:col-span-1 space-y-6">
                <TasksModal patientId={id} patientName={paciente.name} />

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                    <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <User className="h-4.5 w-4.5 text-slate-500" />
                        Informações do Paciente
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Nome Completo
                            </span>
                            <span className="text-sm font-bold text-slate-700 mt-1 block">
                                {paciente.name}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    CPF
                                </span>
                                <span className="text-xs font-bold text-slate-700 mt-1 block font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit">
                                    {paciente.cpf ? maskCPF(paciente.cpf) : "Não informado"}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Código
                                </span>
                                <span className="text-xs font-bold text-slate-650 mt-1 block font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit">
                                    #{paciente.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {paciente.birthDate && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Data de Nascimento
                                </span>
                                <span className="text-xs font-semibold text-slate-700 mt-1 block">
                                    {new Date(paciente.birthDate).toLocaleDateString("pt-BR")}
                                </span>
                            </div>
                        )}

                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Celular / WhatsApp
                            </span>
                            {paciente.phone ? (
                                <a
                                    href={`https://wa.me/${paciente.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 hover:border-emerald-250 text-xs font-bold transition-all mt-1 cursor-pointer"
                                >
                                    <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                                    {maskPhone(paciente.phone)}
                                </a>
                            ) : (
                                <span className="text-xs font-semibold text-slate-400 mt-1 block">Não informado</span>
                            )}
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Observações
                            </span>
                            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 mt-1">
                                <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                                    {paciente.observations || <span className="text-slate-400 italic font-normal">Nenhuma observação cadastrada.</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <PatientAppointmentsSection patientId={id} initialAppointments={appointments} />

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <FileText className="h-4.5 w-4.5 text-slate-500" />
                            Últimas Evoluções
                        </h3>
                        <Link
                            href={`/admin/pacientes/${id}/evolucao`}
                            className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "rounded-xl border-slate-200 text-xs font-bold text-slate-700"
                            )}
                        >
                            <Plus className="mr-1 h-3.5 w-3.5 text-slate-500" /> Adicionar
                        </Link>
                    </div>

                    {latestEvolutions.length > 0 ? (
                        <div className="space-y-3">
                            {latestEvolutions.map((item) => (
                                <div key={item.id} className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl p-3.5 transition-all">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-750 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                                        <span>
                                            {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {new Date(item.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed whitespace-pre-wrap">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-xs text-slate-400 font-semibold">
                                Nenhuma evolução cadastrada para este paciente.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                        <h3 className="text-base font-black text-slate-900">
                            Odontograma Interativo
                        </h3>
                    </div>
                    <OdontogramaTab
                        patientId={id}
                        initialOdontogram={odontogram}
                    />
                </div>
            </div>
        </div>
    );
}
