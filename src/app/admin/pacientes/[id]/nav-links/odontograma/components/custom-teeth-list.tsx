"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToothStatus } from "@/src/types/dashboard/pacientes";
import { CustomTooth } from "@/src/types/dashboard/odontograma";
import { statusConfig } from "../odontograma-client";

interface CustomTeethListProps {
    customTeeth: CustomTooth[];
    selectedCustomToothId: string | null;
    onSelectCustomTooth: (id: string) => void;
    onRemoveCustomTooth: (id: string) => void;
}

export function CustomTeethList({
    customTeeth,
    selectedCustomToothId,
    onSelectCustomTooth,
    onRemoveCustomTooth
}: CustomTeethListProps) {
    if (customTeeth.length === 0) return null;

    return (
        <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm w-full">
            <h4 className="text-sm font-bold text-slate-800">Dentes Supranumerários e Anomalias</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customTeeth.map((ct) => {
                    const conf = statusConfig[(ct.status || "HEALTHY") as ToothStatus];
                    return (
                        <div
                            key={ct.id}
                            onClick={() => onSelectCustomTooth(ct.id)}
                            className={cn(
                                "border rounded-xl p-3 flex flex-col gap-1 cursor-pointer transition-all hover:shadow-xs",
                                selectedCustomToothId === ct.id ? "border-blue-600 bg-blue-50/10" : "border-slate-100 hover:border-slate-350 bg-white"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">{ct.id}</span>
                                <div className="flex items-center gap-2">
                                    <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase", conf.bgLight, conf.text)}>
                                        {conf.label}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveCustomTooth(ct.id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer border-none bg-transparent"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">{ct.description}</p>
                            {ct.notes && (
                                <p className="text-[10px] text-slate-400 mt-1 italic border-t pt-1 border-slate-50 truncate">
                                    {ct.notes}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
