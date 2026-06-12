import { ShieldCheck, Key, CalendarDays, History, Users, ClipboardList, Package } from "lucide-react";
import { NavConfig } from "../types/dashboard/navigation";

export type NavSection = "CLÍNICA" | "ADMINISTRAÇÃO" | "SISTEMA";

export const ADMIN_NAVIGATION: NavConfig[] = [
    {
        title: "Agenda",
        href: "/admin/agenda",
        icon: CalendarDays,
        resource: "agenda",
        section: "CLÍNICA"
    },
    {
        title: "Pacientes",
        href: "/admin/pacientes",
        icon: Users,
        resource: "pacientes",
        section: "CLÍNICA"
    },
    {
        title: "Lab / Envios",
        href: "/admin/trabalhos",
        icon: ClipboardList,
        resource: "pacientes",
        section: "CLÍNICA"
    },
    {
        title: "Produtos",
        href: "/admin/produtos",
        icon: Package,
        resource: "produtos",
        section: "CLÍNICA"
    },
    {
        title: "Administradores",
        href: "/admin/usuarios",
        icon: ShieldCheck,
        resource: "usuarios",
        section: "ADMINISTRAÇÃO"
    },
    {
        title: "Cargos e Permissões",
        href: "/admin/cargos",
        icon: Key,
        resource: "cargos",
        section: "ADMINISTRAÇÃO"
    },

    {
        title: "Auditoria",
        href: "/admin/auditoria",
        icon: History,
        resource: "auditoria",
        section: "SISTEMA"
    },
];

export const PERMISSION_RESOURCES = ADMIN_NAVIGATION
    .filter(nav => nav.resource)
    .map(nav => nav.resource as string);

export const ALL_RESOURCES = [...new Set([...PERMISSION_RESOURCES])];
export const ALL_ACTIONS = ["visualizar", "criar", "editar", "deletar"];
