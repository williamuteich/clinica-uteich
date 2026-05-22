import { requirePermission } from "@/src/lib/auth-helpers-server";
import AgendaContainer from "./components/agenda-container";
import { Suspense } from "react";
import { AgendaSkeleton } from "./components/agenda-skeleton";

async function AgendaContent() {
    await requirePermission("agenda", "visualizar");

    return <AgendaContainer />;
}

export default function AgendaPage() {
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Suspense fallback={<AgendaSkeleton />}>
                <AgendaContent />
            </Suspense>
        </div>
    );
}