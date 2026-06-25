import { getDashboardStats } from "@/src/services/dashboard";
import { DashboardOverview } from "@/src/app/components/admin/dashboard/dashboard-overview";
import { LayoutDashboard } from "lucide-react";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/src/app/components/admin/dashboard/dashboard-skeleton";

export const metadata = {
    title: "Dashboard | Uteich Odontologia",
    description: "Painel de controle e estatísticas de captação.",
};

async function DashboardContent() {
    const data = await getDashboardStats();

    if (!data) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs text-center text-slate-500">
                Não foi possível carregar as informações do dashboard.
            </div>
        );
    }

    return <DashboardOverview data={data} />;
}

export default function AdminPage() {
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8 text-slate-800" />
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Visão geral de captação de leads, agendamentos recentes e desempenho de canais de marketing.
                </p>
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </div>
    );
}
