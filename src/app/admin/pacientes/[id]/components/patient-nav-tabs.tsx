"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PatientNavTabsProps {
    patientId: string;
}

export function PatientNavTabs({ patientId }: PatientNavTabsProps) {
    const pathname = usePathname();

    const tabs = [
        {
            name: "Visão Geral",
            href: `/admin/pacientes/${patientId}`,
            exact: true,
        },
        {
            name: "Anamneses",
            href: `/admin/pacientes/${patientId}/anamnese`,
        },
        {
            name: "Evoluções",
            href: `/admin/pacientes/${patientId}/evolucao`,
        },
        {
            name: "Agendamentos",
            href: `/admin/pacientes/${patientId}/agendamentos`,
        },
        {
            name: "Ficha Cadastral",
            href: `/admin/pacientes/${patientId}/cadastro`,
        },
    ];

    return (
        <div className="flex border-b border-slate-100 mt-6 -mx-6 px-6 overflow-x-auto scrollbar-none">
            <div className="flex space-x-8 min-w-max">
                {tabs.map((tab) => {
                    const isActive = tab.exact 
                        ? pathname === tab.href 
                        : pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "pb-3 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer",
                                isActive
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-slate-500 hover:text-slate-800 border-b-2 border-transparent"
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
