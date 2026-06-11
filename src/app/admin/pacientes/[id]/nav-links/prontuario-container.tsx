import { User, Calendar, Stethoscope, Activity, HeartPulse, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProntuarioContainerProps } from "@/src/types/dashboard/pacientes";

import OdontogramaTab from "./odontograma/odontograma-tab";
import EvolucaoList from "./evolucao/evolucao-list";
import AgendamentosTab from "./agendamentos/agendamentos-tab";
import CadastroTab from "./cadastro/cadastro-tab";
import AnamneseTab from "./anamnese/anamnese-tab";
import { Suspense } from "react";
import { getAgendamentos } from "@/src/services/agendamento";


export default async function ProntuarioContainer({
    paciente,
    initialHistory,
    patientId,
    activeTab,
    initialAnamnese,
    initialOdontogram,
}: ProntuarioContainerProps) {
    let lastAppointment: any = null;
    try {
        const resp = await getAgendamentos({ patientId, page: 1, limit: 100 });
        if (resp && resp.agendamentos && resp.agendamentos.length > 0) {
            lastAppointment = resp.agendamentos.reduce((best: any, cur: any) => {
                if (!best) return cur;
                return new Date(cur.scheduledAt) > new Date(best.scheduledAt) ? cur : best;
            }, resp.agendamentos[0]);
        }
    } catch (err) {
        lastAppointment = null;
    }
    const calcIdade = (birthDate: string) => {
        if (!birthDate) return 0;
        const hoje = new Date();
        const nasc = new Date(birthDate);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return idade;
    };

    const tabHref = (tab: string) => `/admin/pacientes/${patientId}?tab=${tab}`;

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-row items-center gap-3 bg-white p-4 sm:p-6 rounded-sm border border-slate-200/80 shadow-xs w-full">
                <Link
                    href="/admin/pacientes"
                    className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "h-9 w-9 rounded-sm shrink-0"
                    )}
                    title="Voltar para a lista de pacientes"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900 truncate">
                            {paciente.name}
                        </h1>
                        <span
                            className={cn(
                                "w-2.5 h-2.5 rounded-full shadow-sm animate-pulse shrink-0",
                                paciente.active ? "bg-emerald-500" : "bg-rose-500"
                            )}
                            title={paciente.active ? "Paciente Ativo" : "Paciente Inativo"}
                        ></span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="hidden sm:inline">Prontuário Odontológico</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                <div className="bg-white border border-slate-200/80 rounded-sm p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-slate-300">
                    <div className="w-9 h-9 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identificação Básica</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{calcIdade(paciente.birthDate)} anos</p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-px truncate">CPF {paciente.cpf}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-sm p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-slate-300">
                    <div className="w-9 h-9 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <HeartPulse className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status do Paciente</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">{paciente.active ? "Cadastro Ativo" : "Inativo"}</p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-px truncate">Última alteração no cadastro: {new Date(paciente.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-sm p-4 flex items-center gap-3.5 shadow-xs transition-all hover:border-slate-300">
                    <div className="w-9 h-9 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Consulta</p>
                        {lastAppointment ? (
                            <>
                                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{new Date(lastAppointment.scheduledAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(lastAppointment.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                                <p className="text-[11px] font-semibold text-slate-500 mt-px truncate">{lastAppointment.serviceType || "Sem informação"}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">Sem informação</p>
                                <p className="text-[11px] font-semibold text-slate-500 mt-px truncate">&nbsp;</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 border-b pb-px w-full mt-2">
                <Link
                    href={tabHref("odontograma")}
                    className={cn(
                        "px-3.5 py-2 rounded-t-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === "odontograma"
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:bg-slate-50 bg-white"
                    )}
                >
                    <Stethoscope className="h-4 w-4" />
                    Odontograma Interativo 3D
                </Link>

                <Link
                    href={tabHref("evolucao")}
                    className={cn(
                        "px-3.5 py-2 rounded-t-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === "evolucao"
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:bg-slate-50 bg-white"
                    )}
                >
                    <Activity className="h-4 w-4" />
                    Evolução & Procedimentos
                </Link>

                <Link
                    href={tabHref("anamnese")}
                    className={cn(
                        "px-3.5 py-2 rounded-t-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === "anamnese"
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:bg-slate-50 bg-white"
                    )}
                >
                    <HeartPulse className="h-4 w-4" />
                    Anamnese & Saúde
                </Link>

                <Link
                    href={tabHref("agendamentos")}
                    className={cn(
                        "px-3.5 py-2 rounded-t-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === "agendamentos"
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:bg-slate-50 bg-white"
                    )}
                >
                    <Calendar className="h-4 w-4" />
                    Agendamentos
                </Link>

                <Link
                    href={tabHref("cadastro")}
                    className={cn(
                        "px-3.5 py-2 rounded-t-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === "cadastro"
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "text-slate-600 hover:bg-slate-50 bg-white"
                    )}
                >
                    <User className="h-4 w-4" />
                    Ficha Cadastral
                </Link>
            </div>

            <div className="w-full bg-white rounded-md border p-4 sm:p-6 shadow-sm">
                {activeTab === "odontograma" && <OdontogramaTab patientId={patientId} initialOdontogram={initialOdontogram ?? null} />}
                {activeTab === "evolucao" && (
                    <EvolucaoList
                        initialItems={initialHistory ?? []}
                        patientId={patientId}
                    />
                )}
                {activeTab === "anamnese" && <AnamneseTab patientId={patientId} initialAnamnese={initialAnamnese} />}
                {activeTab === "agendamentos" && <AgendamentosTab patientId={patientId} />}
                {activeTab === "cadastro" && (
                    <Suspense fallback={"carregando..."}>
                        <CadastroTab paciente={paciente} />
                    </Suspense>
                )}
            </div>
        </div>
    );
}
