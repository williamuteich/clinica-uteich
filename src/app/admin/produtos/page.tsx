import { Package } from "lucide-react";
import { requirePermission } from "@/src/lib/auth-helpers-server";
import { getProducts, getMovements } from "@/src/services/produtos";
import { Suspense } from "react";
import { ProdutosManagement } from "./components/produtos-management";

export const metadata = {
    title: "Estoque | Uteich Odontologia",
    description: "Gerencie o estoque de produtos da clínica.",
};

async function ProdutosContent() {
    await requirePermission("produtos", "visualizar");

    const [initialProducts, initialMovements] = await Promise.all([
        getProducts({ page: 1, limit: 50 }),
        getMovements({ page: 1, limit: 50 }),
    ]);

    return (
        <ProdutosManagement
            initialProducts={initialProducts ?? { products: [], total: 0 }}
            initialMovements={initialMovements ?? { movements: [], total: 0 }}
        />
    );
}

function ProdutosSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 w-48 rounded-xl bg-slate-100" />
            <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100" />)}
            </div>
            <div className="h-10 rounded-xl bg-slate-100 w-full" />
            <div className="rounded-xl border bg-white overflow-hidden">
                <div className="h-10 bg-slate-100 border-b" />
                {[...Array(5)].map((_, i) => <div key={i} className="h-14 border-b border-slate-100" />)}
            </div>
        </div>
    );
}

export default async function ProdutosPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Suspense fallback={<ProdutosSkeleton />}>
                <ProdutosContent />
            </Suspense>
        </div>
    );
}
