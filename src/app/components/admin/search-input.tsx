"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { SearchInputProps } from "@/src/types/dashboard/components";

export function SearchInput({
    value,
    onChange,
    placeholder = "Pesquisar...",
    className,
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const [debouncedValue] = useDebounce(localValue, 400);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        onChange(debouncedValue);
    }, [debouncedValue, onChange]);

    return (
        <div className={cn("relative flex-1 w-full", className)}>
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full h-10 pl-9 pr-9 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 bg-white placeholder:text-slate-400"
            />
            {localValue.trim() !== "" && (
                <button
                    type="button"
                    onClick={() => {
                        setLocalValue("");
                        onChange("");
                    }}
                    className="absolute right-3 top-3.5 hover:text-slate-650 text-slate-400 cursor-pointer transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
