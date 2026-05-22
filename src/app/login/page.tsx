import { ProviderGoogle } from "./components/ProviderGoogle";
import { SidebarLogin } from "./components/SidebarLogin";
import { getServerSession } from "next-auth";
import { auth } from "@/src/lib/auth-config";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginSkeleton } from "./components/skeleton";

async function LoginContent() {
    const session = await getServerSession(auth);

    if (session) {
        redirect("/admin");
    }
    return (
        <main className="flex min-h-screen w-full">
            <SidebarLogin />
            <ProviderGoogle />
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginSkeleton />}>
            <LoginContent />
        </Suspense>
    );
}