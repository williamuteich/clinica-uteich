import { requireAdminContext } from "@/src/lib/auth-helpers-server";
import { prisma } from "@/src/lib/prisma";
import { Suspense } from "react";
import { PlanosTratamentoManagement } from "./components/planos-tratamento-management";

export const metadata = {
    title: "Planos de Tratamento | Uteich Odontologia",
    description: "Gerencie os procedimentos e planos de tratamento da clínica.",
};

async function PlanosTratamentoContent() {
    await requireAdminContext();

    const treatments = await prisma.treatment.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <PlanosTratamentoManagement initialTreatments={JSON.parse(JSON.stringify(treatments))} />
    );
}

function PlanosTratamentoSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-64 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-10 w-44 bg-slate-100 rounded-xl" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:w-64 bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shrink-0">
                    <div className="h-3 w-16 bg-slate-100 rounded-md" />
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-9 bg-slate-50 rounded-xl w-full" />
                    ))}
                </div>

                <div className="flex-1 w-full space-y-4">
                    <div className="h-14 bg-white border border-slate-200 p-4 rounded-2xl w-full" />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl p-4 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function PlanosTratamentoPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Suspense fallback={<PlanosTratamentoSkeleton />}>
                <PlanosTratamentoContent />
            </Suspense>
        </div>
    );
}