import { Session } from "next-auth";

export function hasPermission(
    session: Session,
    resource: string,
    action: string
): boolean {
    if (!session || !session.user || !session.user.permissions) return false;

    const perms = session.user.permissions as string[];

    return perms.includes("all:all") || perms.includes(`${resource}:${action}`);
}