import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 w-full animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
                        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-7 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs lg:col-span-2">
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-3 w-72 mb-6" />
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-3 w-52" />
                    <Skeleton className="h-[200px] w-full rounded-full mt-2" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full rounded" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-3 w-52" />
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="flex items-start justify-between pb-3 border-b border-slate-100 last:border-0">
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full ml-2" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
