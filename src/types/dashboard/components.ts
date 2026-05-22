import { ReactNode } from "react";
import { Role } from "./admins";

export interface NavItemProps {
    href: string;
    icon: ReactNode;
    children: ReactNode;
    active?: boolean;
}

export interface ViewPermissionsProps {
    roleName: string;
    permissions: Role["permissions"];
}
