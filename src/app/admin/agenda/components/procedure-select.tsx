"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const PROCEDURES = [
    "Consulta de Avaliação",
    "Limpeza e Profilaxia",
    "Clareamento Dental",
    "Aparelho Ortodôntico",
    "Implante Dentário",
    "Prótese Dentária",
    "Extração",
    "Restauração",
    "Tratamento de Canal",
    "Cirurgia Oral",
    "Periodontia",
    "Outro",
] as const;

interface ProcedureSelectProps {
    value: string;
    onChange: (val: string) => void;
    customValue?: string;
    onCustomChange?: (val: string) => void;
}

export function ProcedureSelect({ value, onChange, customValue = "", onCustomChange }: ProcedureSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={ref}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className={cn(
                        "w-full h-10 px-3 flex items-center justify-between text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer",
                        value ? "text-slate-800 border-slate-350" : "text-slate-400 border-slate-200"
                    )}
                >
                    <span className="truncate">{value || "Selecione o procedimento..."}</span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
                </button>

                {open && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-250 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {PROCEDURES.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => {
                                    onChange(p);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                    value === p ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {value === "Outro" && (
                <input
                    type="text"
                    value={customValue}
                    onChange={(e) => onCustomChange?.(e.target.value)}
                    placeholder="Qual é o procedimento?"
                    className="mt-2 w-full h-10 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            )}
        </div>
    );
}
