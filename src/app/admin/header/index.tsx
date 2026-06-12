import { UserDropdown } from "../components/user-dropdown";
import { MobileNav } from "../components/mobile-nav";
import { getServerSession } from "next-auth";
import { auth } from "@/src/lib/auth-config";

export async function Header() {
    const session = await getServerSession(auth);
    if (!session) return null;

    return (
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 w-full z-10 select-none">
            <div className="flex items-center gap-3">
                <MobileNav />

                <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
                    <span>Painel</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-700 font-semibold">Geral</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <UserDropdown session={session} />
            </div>
        </header>
    );
}

export function SkeletonHeader() {
    return (
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 w-full animate-pulse select-none">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-slate-100 lg:hidden shrink-0" />

                <div className="flex items-center gap-2">
                    <div className="h-3 w-10 bg-slate-100 rounded-sm" />
                    <div className="h-3 w-2 bg-slate-100/50 rounded-sm" />
                    <div className="h-3 w-12 bg-slate-100 rounded-sm" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 p-1.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-100" />
                    <div className="hidden md:flex flex-col gap-1.5">
                        <div className="h-3.5 w-24 bg-slate-100 rounded-sm" />
                    </div>
                </div>
            </div>
        </header>
    );
}
