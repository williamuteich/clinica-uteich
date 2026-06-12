import { ReactNode, Suspense } from "react";
import { Header, SkeletonHeader } from "./header";
import { Sidebar, SkeletonSidebar } from "./sidebar";
import { Providers } from "../components/providers";
import { requireAdminContext } from "@/src/lib/auth-helpers-server";

async function AuthGuard() {
    await requireAdminContext();
    return null;
}

export default function PrivateLayout({ children }: { children: ReactNode }) {
    return (
        <Providers>
            <Suspense fallback={null}>
                <AuthGuard />
            </Suspense>

            <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
                <Suspense fallback={
                    <aside className="w-64 bg-white hidden lg:flex flex-col h-full shrink-0 relative transition-transform border-r border-slate-200/80">
                        <SkeletonSidebar />
                    </aside>
                }>
                    <Sidebar />
                </Suspense>

                <div className="flex flex-col flex-1 overflow-hidden w-full max-w-full">
                    <Suspense fallback={<SkeletonHeader />}>
                        <Header />
                    </Suspense>

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </Providers>
    );
}
