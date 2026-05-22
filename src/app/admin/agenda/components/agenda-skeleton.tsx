import { Skeleton } from "@/components/ui/skeleton";

export function AgendaSkeleton() {
    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-md" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>

            <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Skeleton className="h-7 w-20 rounded-md" />
                    <Skeleton className="h-7 w-20 rounded-md" />
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
                <Skeleton className="h-[600px] w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        </div>
    );
}