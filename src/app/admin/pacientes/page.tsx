import { PacientesManagement } from "./components/pacientes-management";
import { Users } from "lucide-react";
import { getPacientes } from "@/src/services/pacientes";
import { requirePermission } from "@/src/lib/auth-helpers-server";
import { Suspense } from "react";
import { PacientesSkeleton } from "./components/pacientes-skeleton";

export const metadata = {
    title: "Pacientes | Uteich Odontologia",
    description: "Gerencie os pacientes da clínica.",
};

async function PacientesContent() {
    await requirePermission("pacientes", "visualizar");
    const initialData = await getPacientes();

    return (
        <PacientesManagement initialData={initialData ?? { pacientes: [], total: 0, page: 1, limit: 20, totalPages: 0 }} />
    );
}

export default async function PacientesAdminPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    Pacientes
                </h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie os dados e prontuários dos pacientes da clínica.
                </p>
            </div>

            <Suspense fallback={<PacientesSkeleton />}>
                <PacientesContent />
            </Suspense>
        </div>
    );
}

