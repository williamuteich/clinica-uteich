"use client";

import { cn } from "@/lib/utils";
import { SelectInputProps } from "@/src/types/dashboard/components";

export function SelectInput({
    value,
    onChange,
    options,
    placeholder = "Selecione...",
    className,
}: SelectInputProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500",
                className
            )}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
