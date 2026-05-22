import { NavSection } from "@/src/lib/navigation";
import { LucideIcon } from "lucide-react";

export interface NavConfig {
    title: string;
    href: string;
    icon: LucideIcon;
    resource?: string;
    section: NavSection;
}