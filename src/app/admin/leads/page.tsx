import { LeadsManagement } from "./components/leads-management";
import { TrendingUp } from "lucide-react";
import { getLeads } from "@/src/services/leads";
import { requirePermission } from "@/src/lib/auth-helpers-server";
import { Suspense } from "react";
import { LeadsSkeleton } from "./components/leads-skeleton";

export const metadata = {
    title: "Leads | Uteich Odontologia",
    description: "Gerencie os leads capturados.",
};

async function LeadsContent() {
    await requirePermission("pacientes", "visualizar");
    const initialData = await getLeads();

    return (
        <LeadsManagement initialData={initialData ?? { leads: [], stats: { total: 0, interested: 0, converted: 0, conversionRate: 0 }, total: 0, page: 1, limit: 20, totalPages: 0 }} />
    );
}

export default async function LeadsAdminPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    Leads
                </h1>
                <p className="text-muted-foreground mt-2">
                    Acompanhe os potenciais pacientes que iniciaram o processo de agendamento online.
                </p>
            </div>

            <Suspense fallback={<LeadsSkeleton />}>
                <LeadsContent />
            </Suspense>
        </div>
    );
}
