import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { NavItemProps } from "@/src/types/dashboard/components";

export function NavItem({ href, icon, children, active }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                active
                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/60"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center stroke-current",
                    active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                )}>
                    {icon}
                </div>
                <span className={cn("font-medium text-[15px]", active && "font-semibold")}>{children}</span>
            </div>

            {active && (
                <ChevronRight className="w-4 h-4 text-blue-400" />
            )}
        </Link>
    );
}
