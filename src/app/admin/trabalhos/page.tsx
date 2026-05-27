import { ClipboardList } from "lucide-react";
import { requirePermission } from "@/src/lib/auth-helpers-server";
import { getTrabalhos, getTrabalhoDashboard } from "@/src/services/trabalhos";
import { Suspense } from "react";
import { TrabalhosManagement } from "./components/trabalhos-management";

export const metadata = {
    title: "Trabalhos Protéticos | Uteich Odontologia",
    description: "Controle de trabalhos enviados a laboratórios parceiros.",
};

async function TrabalhosContent() {
    await requirePermission("pacientes", "visualizar");

    const [initialData, stats] = await Promise.all([
        getTrabalhos({ page: 1, limit: 20 }),
        getTrabalhoDashboard(),
    ]);

    return (
        <TrabalhosManagement
            initialData={initialData ?? { trabalhos: [], total: 0, page: 1, limit: 20, totalPages: 0 }}
            stats={stats ?? { ativos: 0, atrasados: 0, recebidosHoje: 0 }}
        />
    );
}

function TrabalhosSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-100" />
                ))}
            </div>
            <div className="h-14 rounded-xl bg-slate-100 w-full" />
            <div className="rounded-xl border bg-white overflow-hidden shadow-xs">
                <div className="h-10 bg-slate-100 border-b w-full" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 border-b border-slate-100 w-full last:border-none" />
                ))}
            </div>
        </div>
    );
}

export default async function TrabalhosPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ClipboardList className="h-8 w-8 text-blue-600" />
                    Trabalhos Protéticos
                </h1>
                <p className="text-muted-foreground mt-2">
                    Controle de prazos, entregas e status de trabalhos protéticos enviados a laboratórios.
                </p>
            </div>

            <Suspense fallback={<TrabalhosSkeleton />}>
                <TrabalhosContent />
            </Suspense>
        </div>
    );
}
