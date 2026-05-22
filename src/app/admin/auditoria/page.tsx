import { requirePermission } from "@/src/lib/auth-helpers-server";
import { getAuditLogs } from "@/src/services/audit";
import { AuditManagement } from "./components/audit-management";
import { redirect } from "next/navigation";
import { History } from "lucide-react";
import { Suspense } from "react";
import { TableSkeleton } from "../components/table-skeleton";

async function AuditoriaContent() {
    await requirePermission("auditoria", "visualizar");

    const auditData = await getAuditLogs({ page: 1, limit: 20 });

    if (!auditData) {
        redirect("/admin/unauthorized");
    }

    return <AuditManagement initialData={auditData} />;
}

export default async function AuditoriaPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <History className="h-8 w-8 text-indigo-600" />
                    Auditoria do Sistema
                </h1>
                <p className="text-muted-foreground mt-2">
                    Acompanhe todas as ações realizadas pelos usuários na plataforma de forma detalhada.
                </p>
            </div>

            <Suspense fallback={<TableSkeleton colsCount={5} hasHeaderButton={false} />}>
                <AuditoriaContent />
            </Suspense>
        </div>
    );
}
