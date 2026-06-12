import { getAnamnesePaciente } from "@/src/services/anamnese";
import AnamneseTab from "../nav-links/anamnese/anamnese-tab";

import { PatientPageProps } from "@/src/types/dashboard/pacientes";

export default async function PatientAnamnesePage({ params }: PatientPageProps) {
    const { id } = await params;
    const anamnese = await getAnamnesePaciente(id);

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-in fade-in duration-500">
            <AnamneseTab patientId={id} initialAnamnese={anamnese} />
        </div>
    );
}
