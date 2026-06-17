"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProcedureSelectProps, TreatmentOption } from "@/src/types/dashboard/components";

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
    "Outros / Falar com atendente",
    "Outro",
] as const;

export function ProcedureSelect({ value, onChange, customValue = "", onCustomChange }: ProcedureSelectProps) {
    const [open, setOpen] = useState(false);
    const [dbProcedures, setDbProcedures] = useState<TreatmentOption[]>([]);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let active = true;
        async function fetchDbProcedures() {
            try {
                const res = await fetch("/api/admin/planos-tratamento");
                if (!res.ok) return;
                const data = await res.json();
                if (data && Array.isArray(data.treatments)) {
                    const activeTreatments = data.treatments
                        .filter((t: any) => t.active)
                        .map((t: any) => ({
                            name: t.name,
                            valuePrivate: t.valuePrivate,
                            valuePlan: t.valuePlan,
                        }));
                    if (active) {
                        setDbProcedures(activeTreatments);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchDbProcedures();
        return () => {
            active = false;
        };
    }, []);

    const allOptions = useMemo(() => {
        const map = new Map<string, TreatmentOption>();
        PROCEDURES.forEach((p) => {
            if (p !== "Outro" && p !== "Outros / Falar com atendente") {
                map.set(p, { name: p });
            }
        });
        dbProcedures.forEach((p) => {
            map.set(p.name, p);
        });
        map.set("Outros / Falar com atendente", { name: "Outros / Falar com atendente" });
        map.set("Outro", { name: "Outro" });
        return Array.from(map.values());
    }, [dbProcedures]);

    const filteredOptions = useMemo(() => {
        if (!value.trim() || value === "Outro") return allOptions;
        const query = value.toLowerCase();
        return allOptions.filter((opt) => opt.name.toLowerCase().includes(query));
    }, [allOptions, value]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                setOpen(true);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) => (prev + 1) % filteredOptions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                onChange(filteredOptions[focusedIndex].name);
                setOpen(false);
                inputRef.current?.blur();
            }
        } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    useEffect(() => {
        setFocusedIndex(-1);
    }, [value]);

    const selectedTreatment = useMemo(() => {
        const lookup = value === "Outro" ? customValue : value;
        return allOptions.find((opt) => opt.name === lookup);
    }, [allOptions, value, customValue]);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Selecione ou digite o procedimento..."
                    className="w-full h-10 pl-3 pr-10 text-xs border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-800 bg-white placeholder:font-semibold placeholder:text-slate-400"
                />
                <button
                    type="button"
                    onClick={() => {
                        setOpen((o) => !o);
                        if (!open) inputRef.current?.focus();
                    }}
                    className="absolute right-3 text-slate-400 hover:text-slate-650 transition-colors"
                >
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
                </button>
            </div>

            {open && filteredOptions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto scrollbar-thin">
                    {filteredOptions.map((opt, index) => {
                        const isSelected = value === opt.name;
                        const isFocused = index === focusedIndex;
                        return (
                            <button
                                key={opt.name}
                                type="button"
                                onClick={() => {
                                    onChange(opt.name);
                                    setOpen(false);
                                }}
                                onMouseEnter={() => setFocusedIndex(index)}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between",
                                    isSelected && "bg-blue-50 text-blue-700",
                                    isFocused && !isSelected && "bg-slate-50 text-slate-800",
                                    !isSelected && !isFocused && "text-slate-700 hover:bg-slate-50 hover:text-slate-800"
                                )}
                            >
                                <div className="flex flex-col text-left py-0.5">
                                    <span className="truncate pr-2">{opt.name}</span>
                                    {opt.valuePrivate !== undefined && opt.valuePlan !== undefined && (
                                        <span className="text-[10px] text-slate-450 font-semibold mt-0.5">
                                            Particular: R$ {opt.valuePrivate.toFixed(2)} | Plano: R$ {opt.valuePlan.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                {isSelected && <Check className="h-3.5 w-3.5 text-blue-650 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {value === "Outro" && (
                <input
                    type="text"
                    value={customValue}
                    onChange={(e) => onCustomChange?.(e.target.value)}
                    placeholder="Qual é o procedimento personalizado?"
                    className="mt-2 w-full h-10 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-800 bg-white"
                    required
                />
            )}

            {selectedTreatment && selectedTreatment.valuePrivate !== undefined && selectedTreatment.valuePlan !== undefined && (
                <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700 animate-in fade-in duration-200">
                    <span>Particular: R$ {selectedTreatment.valuePrivate.toFixed(2)}</span>
                    <span className="text-blue-200">|</span>
                    <span>Plano: R$ {selectedTreatment.valuePlan.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}
