"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import {
    Eye,
    Fingerprint,
    Pencil,
    Plus,
    ShieldCheck,
    ShieldIcon,
    Trash2,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

import { ViewPermissionsProps } from "@/src/types/dashboard/components";

const ACTION_ICONS: Record<
    string,
    {
        icon: LucideIcon;
        className: string;
    }
> = {
    visualizar: {
        icon: Eye,
        className:
            "border-sky-200 bg-sky-50 text-sky-700",
    },

    criar: {
        icon: Plus,
        className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    editar: {
        icon: Pencil,
        className:
            "border-amber-200 bg-amber-50 text-amber-700",
    },

    deletar: {
        icon: Trash2,
        className:
            "border-rose-200 bg-rose-50 text-rose-700",
    },
};

export function ViewPermissions({
    permissions,
    roleName,
}: ViewPermissionsProps) {
    const grouped: Record<string, string[]> = {};

    permissions.forEach(permission => {
        const resource = permission.permission.resource;
        const action = permission.permission.action;

        if (!grouped[resource]) {
            grouped[resource] = [];
        }

        grouped[resource].push(action);
    });

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <button className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 transition-colors group-hover:bg-indigo-100">
                            <Fingerprint className="h-3.5 w-3.5" />
                        </div>

                        <span>Permissões</span>
                    </button>
                }
            />

            <DialogContent className="w-[95vw] max-w-3xl sm:max-w-3xl rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl">
                <DialogHeader className="border-b border-slate-100 px-5 py-4">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-white">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="truncate text-lg font-black tracking-tight text-slate-900">
                                {roleName}
                            </div>

                            <div className="text-sm text-slate-500">
                                Permissões vinculadas
                            </div>
                        </div>
                    </DialogTitle>

                    <DialogDescription className="hidden">
                        Permissões do cargo
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[50vh] overflow-y-auto px-4 py-0 custom-scrollbar">
                    {Object.entries(grouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                                <ShieldIcon className="h-7 w-7 text-slate-300" />
                            </div>

                            <h3 className="text-sm font-semibold text-slate-700">
                                Nenhuma permissão encontrada
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                Este cargo não possui acessos configurados.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(grouped).map(
                                ([resource, actions]) => (
                                    <div
                                        key={resource}
                                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="min-w-0">
                                                <h4 className="truncate text-sm font-bold uppercase tracking-wide text-slate-800">
                                                    {resource}
                                                </h4>
                                            </div>

                                            <Badge className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-none hover:bg-slate-50">
                                                {actions.length}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {actions.map(action => {
                                                const config =
                                                    ACTION_ICONS[action] || {
                                                        icon: ShieldIcon,
                                                        className:
                                                            "border-slate-200 bg-slate-100 text-slate-700",
                                                    };

                                                const Icon = config.icon;

                                                return (
                                                    <div
                                                        key={action}
                                                        className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold ${config.className}`}
                                                    >
                                                        <Icon className="h-3 w-3 shrink-0" />

                                                        <span className="capitalize">
                                                            {action}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}