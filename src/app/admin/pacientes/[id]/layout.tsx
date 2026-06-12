import { Suspense } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/src/lib/auth-helpers-server";
import { getPaciente } from "@/src/services/pacientes";
import { UserCircle2 } from "lucide-react";
import { PatientNavTabs } from "./components/patient-nav-tabs";
import { ProntuarioSkeleton } from "./components/prontuario-skeleton";
import { PatientLayoutProps } from "@/src/types/dashboard/pacientes";

async function PatientLayoutContent({ children, params }: PatientLayoutProps) {
    await requirePermission("pacientes", "visualizar");

    const { id } = await params;
    const paciente = await getPaciente(id);

    if (!paciente) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-rose-100 to-rose-200 flex items-center justify-center shadow-lg">
                        <span className="text-rose-600 text-5xl font-bold">?</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Paciente não encontrado
                    </h2>
                    <p className="text-lg text-slate-500">
                        O paciente que você está tentando visualizar não existe ou foi removido.
                    </p>
                </div>
                <Link
                    href="/admin/pacientes"
                    className={cn(
                        buttonVariants({ variant: "default", size: "lg" }),
                        "bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    )}
                >
                    ← Voltar para Pacientes
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                            <UserCircle2 className="h-14 w-14" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                    {paciente.name}
                                </h1>
                                <span
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full shadow-sm shrink-0",
                                        paciente.active ? "bg-emerald-500" : "bg-rose-500"
                                    )}
                                    title={paciente.active ? "Paciente Ativo" : "Paciente Inativo"}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold">
                                {paciente.phone && (
                                    <a
                                        href={`https://wa.me/${paciente.phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.102-2.884-6.964-1.861-1.862-4.332-2.887-6.967-2.889-5.442 0-9.866 4.42-9.869 9.866-.001 1.79.468 3.54 1.358 5.093l-.988 3.598 3.662-.961zm10.742-7.531c-.266-.134-1.58-.78-1.821-.867-.243-.088-.419-.133-.596.134-.176.265-.685.867-.837 1.042-.154.177-.308.199-.574.065-.266-.134-1.127-.415-2.147-1.326-.79-.705-1.327-1.577-1.482-1.844-.155-.267-.017-.411.117-.544.12-.12.267-.312.4-.468.135-.156.177-.267.266-.445.088-.178.045-.334-.022-.468-.067-.134-.596-1.437-.817-1.97-.215-.522-.452-.451-.62-.46-.157-.008-.337-.01-.518-.01-.18 0-.473.067-.72.337-.247.269-.942.922-.942 2.248s.965 2.607 1.098 2.786c.135.18 1.902 2.904 4.609 4.073.645.278 1.147.445 1.54.57.649.206 1.24.177 1.707.107.521-.078 1.58-.646 1.802-1.238.222-.593.222-1.101.155-1.206-.067-.107-.247-.152-.513-.286z" />
                                        </svg>
                                        {paciente.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/admin/pacientes/${id}/cadastro`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </Link>
                </div>
                <PatientNavTabs patientId={id} />
            </div>

            <div className="w-full">
                {children}
            </div>
        </div>
    );
}

export default function PatientLayout({ children, params }: PatientLayoutProps) {
    return (
        <Suspense fallback={<ProntuarioSkeleton />}>
            <PatientLayoutContent params={params}>
                {children}
            </PatientLayoutContent>
        </Suspense>
    );
}
