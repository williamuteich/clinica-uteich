interface TableSkeletonProps {
    rowsCount?: number;
    colsCount?: number;
    hasHeaderButton?: boolean;
    buttonWidthClass?: string;
}

export function TableSkeleton({
    rowsCount = 5,
    colsCount = 4,
    hasHeaderButton = true,
    buttonWidthClass = "w-36"
}: TableSkeletonProps) {

    return (
        <div className="w-full flex flex-col gap-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="h-10 w-full sm:w-72 rounded-xl bg-slate-200" />
                {hasHeaderButton && (
                    <div className={`h-11 ${buttonWidthClass} rounded-xl bg-slate-200`} />
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
                <div className="space-y-4">
                    <div
                        className="grid border-b border-slate-100 pb-4"
                        style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: colsCount }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-5 w-24 rounded bg-slate-200 ${i === colsCount - 1 ? "justify-self-end" : ""}`}
                            />
                        ))}
                    </div>

                    {Array.from({ length: rowsCount }).map((_, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="grid items-center py-3.5 border-b border-slate-50 last:border-b-0"
                            style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }}
                        >
                            {Array.from({ length: colsCount }).map((_, colIndex) => {
                                if (colIndex === colsCount - 1) {
                                    return (
                                        <div key={colIndex} className="flex justify-end gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200" />
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200" />
                                        </div>
                                    );
                                }
                                if (colIndex === 0) {
                                    return (
                                        <div key={colIndex} className="flex items-center gap-3">
                                            <div className="h-5 w-36 rounded bg-slate-200" />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={colIndex} className="h-5 w-24 rounded bg-slate-100" />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
