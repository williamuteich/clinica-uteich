import { getPaciente } from "@/src/services/pacientes";
import CadastroTab from "../nav-links/cadastro/cadastro-tab";

interface CadastroPageProps {
    params: Promise<{ id: string }>;
}

export default async function PatientCadastroPage({ params }: CadastroPageProps) {
    const { id } = await params;
    const paciente = await getPaciente(id);

    if (!paciente) return null;

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-in fade-in duration-500">
            <CadastroTab paciente={paciente} />
        </div>
    );
}
