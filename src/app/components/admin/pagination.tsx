"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationProps } from "@/src/types/dashboard/components";

export function Pagination({
    page,
    totalPages,
    total,
    limit,
    itemName = "itens",
    onPageChange,
    disabled = false,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className="p-4 border-t bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
                Mostrando <span className="font-bold text-slate-700">{from}</span>–
                <span className="font-bold text-slate-700">{to}</span> de{" "}
                <span className="font-bold text-slate-700">{total}</span> {itemName}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1 || disabled}
                    className="h-8 text-xs font-bold gap-1 cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <div className="flex items-center gap-1 px-2.5 text-xs sm:text-sm font-bold text-slate-750 bg-slate-100/60 rounded-md py-1 border border-slate-200/50">
                    <span>{page}</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500">{totalPages}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || disabled}
                    className="h-8 text-xs font-bold gap-1 cursor-pointer"
                >
                    Próximo <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
