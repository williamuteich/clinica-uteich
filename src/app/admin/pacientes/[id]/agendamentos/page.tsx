import AgendamentosTab from "../nav-links/agendamentos/agendamentos-tab";

import { PatientPageProps } from "@/src/types/dashboard/pacientes";

export default async function PatientAgendamentosPage({ params }: PatientPageProps) {
    const { id } = await params;

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-in fade-in duration-500">
            <AgendamentosTab patientId={id} />
        </div>
    );
}
