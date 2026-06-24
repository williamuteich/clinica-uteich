export function LeadsSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full animate-pulse">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="h-11 w-72 rounded-xl bg-slate-200" />
                        <div className="h-11 w-40 rounded-xl bg-slate-200" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-7 gap-4 p-4 bg-slate-100 border-b border-slate-200">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-20 rounded bg-slate-200 ml-auto" />
                    </div>

                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-7 gap-4 p-4 border-b border-slate-100 last:border-none items-center"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200" />
                                <div className="h-4 w-24 rounded bg-slate-200" />
                            </div>
                            <div className="h-4 w-24 rounded bg-slate-200" />
                            <div className="h-4 w-24 rounded bg-slate-200" />
                            <div className="h-4 w-32 rounded bg-slate-200" />
                            <div className="h-4 w-24 rounded bg-slate-200" />
                            <div className="h-4 w-24 rounded bg-slate-200" />
                            <div className="flex justify-end gap-2">
                                <div className="h-9 w-9 rounded-lg bg-slate-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
