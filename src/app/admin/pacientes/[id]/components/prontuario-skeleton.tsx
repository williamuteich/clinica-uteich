export function ProntuarioSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full animate-pulse">
            <div className="flex flex-row items-center gap-3 bg-white p-4 sm:p-6 rounded-sm border border-slate-200/80 shadow-xs w-full">
                <div className="w-9 h-9 rounded-sm bg-slate-200 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-7 w-48 rounded bg-slate-200" />
                    <div className="h-3.5 w-32 rounded bg-slate-100" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200/80 rounded-sm p-4 flex items-center gap-3.5 shadow-xs">
                        <div className="w-9 h-9 rounded-sm bg-slate-100 border border-slate-200 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-24 rounded bg-slate-200" />
                            <div className="h-4 w-32 rounded bg-slate-200" />
                            <div className="h-3 w-40 rounded bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-1 border-b pb-px w-full mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-36 rounded-t-md bg-slate-100 border border-slate-200" />
                ))}
            </div>

            <div className="w-full bg-white rounded-md border p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8 w-full">
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="h-5 w-48 rounded bg-slate-200" />
                                <div className="h-3.5 w-64 rounded bg-slate-100" />
                            </div>
                            <div className="flex gap-3">
                                <div className="h-9 w-52 rounded-lg bg-slate-100 border border-slate-200" />
                                <div className="h-9 w-40 rounded-md bg-slate-200" />
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-md p-6 min-h-[350px] flex flex-col items-center justify-center gap-10">
                            <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 p-2">
                                        <div className="h-3 w-6 rounded bg-slate-200" />
                                        <div className="w-10 h-10 rounded-md bg-slate-200" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    </div>
                                ))}
                            </div>
                            <div className="w-full max-w-2xl border-t border-dashed border-slate-200" />
                            <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 p-2">
                                        <div className="h-3 w-6 rounded bg-slate-200" />
                                        <div className="w-10 h-10 rounded-md bg-slate-200" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div className="space-y-1.5">
                                    <div className="h-4 w-56 rounded bg-slate-200" />
                                    <div className="h-3 w-72 rounded bg-slate-100" />
                                </div>
                                <div className="h-8 w-40 rounded-md bg-slate-100 border border-slate-200" />
                            </div>
                            <div className="h-14 rounded-lg bg-slate-100 border border-dashed border-slate-200" />
                        </div>
                    </div>

                    <div className="w-full lg:w-[320px] bg-slate-50 border rounded-md p-5 flex flex-col gap-5 self-stretch shadow-sm">
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                            <div className="h-10 w-10 rounded-full bg-slate-200" />
                            <div className="h-4 w-32 rounded bg-slate-200" />
                            <div className="h-3 w-48 rounded bg-slate-100" />
                            <div className="h-3 w-40 rounded bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}