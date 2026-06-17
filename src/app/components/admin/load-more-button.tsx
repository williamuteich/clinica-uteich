"use client";

import { LoadMoreButtonProps } from "@/src/types/dashboard/components";

export function LoadMoreButton({
    visibleCount,
    totalCount,
    onLoadMore,
    itemName = "itens",
}: LoadMoreButtonProps) {
    if (totalCount <= visibleCount) return null;

    const remaining = totalCount - visibleCount;

    return (
        <div className="flex justify-center pt-4">
            <button
                type="button"
                onClick={onLoadMore}
                className="inline-flex items-center justify-center gap-1.5 px-6 h-10 border-2 border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
                Carregar mais {itemName} ({remaining} restantes)
            </button>
        </div>
    );
}
