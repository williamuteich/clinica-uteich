import { DashboardSummary } from "./components/summary-cards";
import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8 text-blue-600" />
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Bem-vindo ao painel de controle central. Utilize o menu lateral para gerenciar o sistema.
                </p>
            </div>

            <DashboardSummary />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
                    <h3 className="font-semibold text-lg mb-2">Acesso Rápido</h3>
                    <p className="text-sm text-muted-foreground mb-4">Clique nas opções abaixo para gerenciar os usuários do sistema.</p>
                    <div className="flex gap-3">
                        <a href="/admin/usuarios" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Ver Administradores</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
