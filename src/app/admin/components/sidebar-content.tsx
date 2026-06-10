"use client";

import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { Stethoscope } from "lucide-react";

import { NavItem } from "./nav-item";
import { hasPermission } from "@/src/lib/auth-helpers";
import { ADMIN_NAVIGATION } from "@/src/lib/navigation";

export function SidebarContent({
    session,
    onClose,
}: {
    session: Session;
    onClose?: () => void;
}) {
    const pathname = usePathname();

    const sections = [
        "CLÍNICA",
        "ADMINISTRAÇÃO",
        "SISTEMA",
    ] as const;

    return (
        <div className="flex h-full flex-col border-r border-slate-200 bg-white">
            <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 shadow-sm">
                        <Stethoscope
                            size={22}
                            strokeWidth={2.2}
                            className="text-white"
                        />
                    </div>

                    <div className="min-w-0">
                        <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
                            Uteich Odontologia
                        </h1>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Sistema de Gestão Clínica
                        </p>
                    </div>
                </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-6">
                    {sections.map(section => {
                        const sectionItems = ADMIN_NAVIGATION.filter(
                            item => item.section === section
                        );

                        const visibleItems = sectionItems.filter(item => {
                            if (!item.resource) return true;

                            return hasPermission(
                                session,
                                item.resource,
                                "visualizar"
                            );
                        });

                        if (visibleItems.length === 0) {
                            return null;
                        }

                        return (
                            <section
                                key={section}
                                className="space-y-2"
                            >
                                <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {section}
                                </div>

                                <div className="space-y-1">
                                    {visibleItems.map(item => {
                                        const isActive =
                                            item.href === "/admin"
                                                ? pathname === "/admin"
                                                : pathname === item.href ||
                                                pathname?.startsWith(
                                                    `${item.href}/`
                                                );

                                        return (
                                            <div
                                                key={item.title}
                                                onClick={onClose}
                                            >
                                                <NavItem
                                                    href={item.href}
                                                    icon={
                                                        <item.icon
                                                            size={18}
                                                            strokeWidth={2.2}
                                                        />
                                                    }
                                                    active={isActive}
                                                >
                                                    {item.title}
                                                </NavItem>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}