import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/src/lib/auth-helpers-server";
import ProntuarioContainer from "./nav-links/prontuario-container";
import { Suspense } from "react";
import { ProntuarioSkeleton } from "./components/prontuario-skeleton";
import { getAnamnesePaciente } from "@/src/services/anamnese";
import { getHistoricoPaciente, getPaciente } from "@/src/services/pacientes";
import { getOdontogramaPaciente } from "@/src/services/odontograma";

async function ProntuarioContent({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    await requirePermission("pacientes", "visualizar");

    const { id } = await params;
    const { tab = "odontograma" } = await searchParams;
    const activeTab = ["odontograma", "evolucao", "anamnese", "agendamentos", "cadastro"].includes(tab)
        ? tab
        : "odontograma";

    const [paciente, historicoPaciente, anamnese, odontogram] = await Promise.all([
        getPaciente(id),
        activeTab === "evolucao" ? getHistoricoPaciente(id) : Promise.resolve(null),
        activeTab === "anamnese" ? getAnamnesePaciente(id) : Promise.resolve(null),
        activeTab === "odontograma" ? getOdontogramaPaciente(id) : Promise.resolve(null),
    ]);

    if (!paciente) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-xl">!</div>
                <h2 className="text-xl font-bold text-slate-900">Paciente não encontrado</h2>
                <p className="text-muted-foreground max-w-xs">O paciente que você está tentando visualizar não existe ou foi removido.</p>
                <Link
                    href="/admin/pacientes"
                    className={cn(buttonVariants({ variant: "default" }), "bg-blue-600 hover:bg-blue-700 text-white")}
                >
                    Voltar para Pacientes
                </Link>
            </div>
        );
    }

    return (
        <ProntuarioContainer
            paciente={paciente}
            patientId={id}
            activeTab={activeTab}
            initialHistory={activeTab === "evolucao" ? historicoPaciente || [] : undefined}
            initialAnamnese={activeTab === "anamnese" ? anamnese : undefined}
            initialOdontogram={activeTab === "odontograma" ? odontogram : undefined}
        />
    );
}

export default async function ProntuarioPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    return (
        <Suspense fallback={<ProntuarioSkeleton />}>
            <ProntuarioContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}
