import { Calendar, Stethoscope, HeartPulse, ChevronLeft, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">


            <div className="w-full bg-white rounded-md border p-4 sm:p-6 shadow-sm">
                {activeTab === "odontograma" && (
                    <OdontogramaTab patientId={patientId} initialOdontogram={initialOdontogram ?? null} />
                )}
                {activeTab === "evolucao" && (
                    <EvolucaoList initialItems={initialHistory ?? []} patientId={patientId} />
                )}
                {activeTab === "anamnese" && (
                    <AnamneseTab patientId={patientId} initialAnamnese={initialAnamnese} />
                )}
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