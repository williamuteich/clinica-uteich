import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

export function AgendaSkeleton() {
    return (
        <div className="space-y-6 w-full animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between gap-4 border-b pb-4">
                <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-blue-600" />
                        Agenda
                    </h2>
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4"
                    >
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />

                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-10 w-20 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-9 w-36 rounded-xl ml-2" />
                </div>

                <Skeleton className="h-10 w-52 rounded-xl" />
            </div>

            <div className="w-full">
                <div className="border rounded-xl p-4 bg-card">
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-8 rounded-md"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="aspect-square rounded-lg"
                            />
                        ))}
                    </div>
                </div>

                {/* Próximos agendamentos 
                <div className="border rounded-xl p-4 bg-card">
                    <Skeleton className="h-6 w-40 mb-4" />

                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="border rounded-lg p-3 space-y-2"
                            >
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        ))}
                    </div>
                    
                </div>
                */}
            </div>
        </div>
    );
}