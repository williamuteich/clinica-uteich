export function LoginSkeleton() {
    return (
        <main className="flex min-h-screen w-full animate-pulse overflow-hidden">
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 p-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-slate-800 rounded-full blur-3xl opacity-40 -translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800 rounded-full blur-3xl opacity-40 translate-x-20 translate-y-20" />

                <div className="relative z-10 flex flex-col justify-between w-full">
                    <div className="h-12 w-40 rounded-xl bg-slate-800" />

                    <div className="space-y-5 max-w-md">
                        <div className="h-12 w-72 rounded-xl bg-slate-800" />
                        <div className="space-y-3">
                            <div className="h-4 w-full rounded bg-slate-800" />
                            <div className="h-4 w-5/6 rounded bg-slate-800" />
                            <div className="h-4 w-4/6 rounded bg-slate-800" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-3 w-32 rounded bg-slate-800" />
                            <div className="h-3 w-24 rounded bg-slate-800" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-20 translate-y-20" />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <div className="h-12 w-40 rounded-xl bg-slate-200 mb-6 lg:hidden" />

                        <div className="h-10 w-72 rounded-xl bg-slate-200 mb-3" />
                        <div className="space-y-2 w-full flex flex-col items-center">
                            <div className="h-4 w-80 rounded bg-slate-200" />
                            <div className="h-4 w-64 rounded bg-slate-200" />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100/80">
                        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-100 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />

                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-full rounded bg-slate-200" />
                                <div className="h-3 w-5/6 rounded bg-slate-200" />
                            </div>
                        </div>

                        <div className="w-full h-14 rounded-xl bg-slate-200" />
                    </div>
                </div>
            </div>
        </main>
    );
}