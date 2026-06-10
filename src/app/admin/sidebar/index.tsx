import { getServerSession } from "next-auth";
import { SidebarContent } from "../components/sidebar-content";
import { auth } from "@/src/lib/auth-config";

export async function Sidebar() {
    const session = await getServerSession(auth);
    if (!session) return null;

    return (
        <aside className="w-64 bg-white hidden lg:flex flex-col h-full shrink-0 relative transition-transform">
            <SidebarContent session={session} />
        </aside>
    );
}

export function SkeletonSidebar() {
    return (
        <div className="flex h-full flex-col border-r border-slate-200/80 bg-white">
            <div className="flex h-20 items-center px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-sm bg-slate-200 animate-pulse" />

                    <div className="space-y-2">
                        <div className="h-3.5 w-24 rounded-sm bg-slate-200 animate-pulse" />
                        <div className="h-2 w-16 rounded-sm bg-slate-100 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-8 custom-scrollbar animate-pulse">
                {[1, 2, 3].map(section => (
                    <div key={section} className="space-y-3">
                        <div className="ml-3 h-2.5 w-14 rounded-sm bg-slate-200 animate-pulse" />

                        <div className="space-y-1">
                            {[1, 2, 3].map(item => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-sm px-3 py-3"
                                >
                                    <div className="h-5 w-5 rounded-sm bg-slate-200 animate-pulse shrink-0" />

                                    <div className="h-3 w-28 rounded-sm bg-slate-200 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-100 p-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-sm bg-slate-200 animate-pulse" />

                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-24 rounded-sm bg-slate-200 animate-pulse" />
                        <div className="h-2.5 w-16 rounded-sm bg-slate-100 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
