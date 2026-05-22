import { getServerSession } from "next-auth";
import { auth } from "@/src/lib/auth-config";
import { redirect } from "next/navigation";
import { hasPermission } from "./auth-helpers";
export { hasPermission };

// Para Server Components
export async function requireAdminContext() {
    const session = await getServerSession(auth);
    if (!session || session.user.tipo !== "ADMINISTRATOR") {
        redirect("/");
    }
    return session;
}

// Para API Routes
export async function checkAdminApi() {
    const session = await getServerSession(auth);
    if (!session || session.user.tipo !== "ADMINISTRATOR") {
        return null;
    }
    return session;
}

// Para Server Components que precisam de permissão específica
export async function requirePermission(resource: string, action: string) {
    const session = await getServerSession(auth);
    if (!session || session.user.tipo !== "ADMINISTRATOR") {
        redirect("/");
    }
    if (!hasPermission(session, resource, action)) {
        redirect("/admin/unauthorized");
    }
    return session;
}
