import { getHistoricoPaciente } from "@/src/services/historico";
import EvolucaoList from "../nav-links/evolucao/evolucao-list";

import { PatientPageProps } from "@/src/types/dashboard/pacientes";

export default async function PatientEvolucaoPage({ params }: PatientPageProps) {
    const { id } = await params;
    const historico = await getHistoricoPaciente(id);

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-in fade-in duration-500">
            <EvolucaoList patientId={id} initialItems={historico ?? []} />
        </div>
    );
}
