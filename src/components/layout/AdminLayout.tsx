import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    CalendarDays,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutInnerProps {
    children: ReactNode;
    onLogout: () => void;
    userEmail?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navItems = [
    { label: "Pacientes", icon: Users, tab: "patients" },
    { label: "Agenda", icon: CalendarDays, tab: "agenda" },
];

export function AdminLayout({
    children,
    onLogout,
    userEmail,
    activeTab,
    onTabChange,
}: AdminLayoutInnerProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 w-64 z-30 flex flex-col",
                    "bg-white border-r border-gray-100 shadow-sm",
                    "transform transition-transform duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0 lg:static lg:z-auto"
                )}
            >
                <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-card flex items-center justify-center flex-shrink-0 shadow-button">
                            <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-gray-900 font-semibold text-sm leading-none">Uteich Admin</p>
                            <p className="text-gray-400 text-xs mt-0.5">Painel de controle</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 pt-5 pb-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Menu
                    </p>
                </div>

                <nav className="flex-1 px-3 py-2 space-y-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.tab;
                        return (
                            <button
                                key={item.tab}
                                onClick={() => {
                                    onTabChange(item.tab);
                                    setSidebarOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-4 h-4 flex-shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                                    )}
                                />
                                <span className="flex-1 text-left">{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="w-3.5 h-3.5 text-primary/50" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                    >
                        <span className="text-gray-400">←</span>
                        <span>Ver site</span>
                    </Link>

                    {userEmail && (
                        <div className="px-3 py-2">
                            <p className="text-gray-400 text-xs truncate">{userEmail}</p>
                        </div>
                    )}

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-14 bg-white border-b border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-gray-800 font-semibold text-sm">
                                {navItems.find((n) => n.tab === activeTab)?.label ?? "Painel"}
                            </h1>
                            <p className="text-gray-400 text-xs hidden sm:block">
                                Uteich Odontologia · Painel administrativo
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-card flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">
                                {userEmail?.[0]?.toUpperCase() ?? "A"}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    <div className="w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
