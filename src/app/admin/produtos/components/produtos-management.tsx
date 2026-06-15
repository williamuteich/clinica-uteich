"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Package, AlertTriangle, CalendarClock, Search, Plus, Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import { deleteProduct, getProducts, getMovements } from "@/src/services/produtos";
import { DeleteDialogGeneric } from "@/src/app/components/admin/delete-dialog-generic";
import { GerenciarEstoqueModal } from "./gerenciar-estoque-modal";
import { VisualizarAlertasModal } from "./visualizar-alertas-modal";
import { ProdutosManagementProps, Product, StockMovement } from "@/src/types/dashboard/produtos";
import { useDebounce } from "@/src/hook/use-debounce";

function formatExpiration(date?: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR");
}

export function ProdutosManagement({ initialProducts, initialMovements }: ProdutosManagementProps) {
    const [tab, setTab] = useState<"produtos" | "historico">("produtos");
    const [products, setProducts] = useState<Product[]>(initialProducts?.products ?? []);
    const [prodTotal, setProdTotal] = useState(initialProducts?.total ?? 0);
    const [prodPage, setProdPage] = useState(1);

    const [movements, setMovements] = useState<StockMovement[]>(initialMovements?.movements ?? []);
    const [movTotal, setMovTotal] = useState(initialMovements?.total ?? 0);
    const [movPage, setMovPage] = useState(1);

    const [prodSearch, setProdSearch] = useState("");
    const [movSearch, setMovSearch] = useState("");

    const debouncedProdSearch = useDebounce(prodSearch, 700);
    const debouncedMovSearch = useDebounce(movSearch, 700);

    const [isPending, startTransition] = useTransition();
    const [gerenciarOpen, setGerenciarOpen] = useState(false);

    const LIMIT = 20;

    const low = products.filter((p: Product) => p.quantity <= p.minimumQuantity).length;
    const expiring = products.filter((p: Product) => {
        if (!p.expirationDate) return false;
        const d = new Date(p.expirationDate);
        const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diff <= 30 && diff >= 0;
    }).length;

    const fetchProducts = useCallback((page = 1, query = "") => {
        startTransition(async () => {
            const res = await getProducts({ page, limit: LIMIT, query });
            if (res) { setProducts(res.products); setProdTotal(res.total); setProdPage(page); }
        });
    }, []);

    const fetchMovements = useCallback((page = 1, query = "") => {
        startTransition(async () => {
            const res = await getMovements({ page, limit: LIMIT, query });
            if (res) { setMovements(res.movements); setMovTotal(res.total); setMovPage(page); }
        });
    }, []);

    useEffect(() => {
        fetchProducts(1, debouncedProdSearch);
    }, [debouncedProdSearch, fetchProducts]);

    useEffect(() => {
        fetchMovements(1, debouncedMovSearch);
    }, [debouncedMovSearch, fetchMovements]);

    const refresh = () => { fetchProducts(1, prodSearch); fetchMovements(1, movSearch); };

    const handleDelete = async (id: string) => deleteProduct(id);

    return (
        <div className="space-y-6">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Package className="h-6 w-6 text-blue-600" />
                    Estoque
                </h1>
                <Button
                    onClick={() => setGerenciarOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 rounded-lg cursor-pointer"
                >
                    <Plus className="h-4 w-4 mr-2" /> Gerenciar estoque
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex border-b border-slate-200 px-6 pt-4 gap-6">
                    {(["produtos", "historico"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            {t === "produtos" ? "Produtos" : "Histórico de movimentação"}
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-5">
                    {tab === "produtos" && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center justify-between border rounded-xl p-4 bg-white">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Produtos cadastrados</p>
                                            <p className="text-2xl font-bold text-slate-800">{prodTotal}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-between border rounded-xl p-4 ${low > 0 ? "border-red-200 bg-red-50" : "bg-white"}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className={`h-5 w-5 ${low > 0 ? "text-red-500" : "text-slate-400"}`} />
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estoque baixo</p>
                                            <p className={`text-2xl font-bold ${low > 0 ? "text-red-600" : "text-slate-800"}`}>{low}</p>
                                        </div>
                                    </div>
                                    {low > 0 && (
                                        <VisualizarAlertasModal
                                            products={products}
                                            initialType="low"
                                            trigger={
                                                <button className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer">
                                                    Visualizar
                                                </button>
                                            }
                                        />
                                    )}
                                </div>
                                <div className="flex items-center justify-between border rounded-xl p-4 bg-white">
                                    <div className="flex items-center gap-3">
                                        <CalendarClock className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vencimento próximo</p>
                                            <p className="text-2xl font-bold text-slate-800">{expiring}</p>
                                        </div>
                                    </div>
                                    {expiring > 0 && (
                                        <VisualizarAlertasModal
                                            products={products}
                                            initialType="expiring"
                                            trigger={
                                                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                                                    Visualizar
                                                </button>
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Pesquisar por produto"
                                    value={prodSearch}
                                    onChange={(e) => setProdSearch(e.target.value)}
                                    className="pl-9 h-10 bg-white"
                                />
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                <Table>
                                    <TableHeader className="bg-slate-900 border-none">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="font-bold text-slate-100 py-3.5 pl-4">Produto</TableHead>
                                            <TableHead className="font-bold text-slate-100 py-3.5 pl-4 text-center">Em estoque</TableHead>
                                            <TableHead className="font-bold text-slate-100 py-3.5 pl-4 text-center">Quantidade mínima</TableHead>
                                            <TableHead className="font-bold text-slate-100 py-3.5 pl-4">Validade</TableHead>
                                            <TableHead className="text-right text-white">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-slate-400 py-10 text-sm">
                                                    Nenhum produto cadastrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : products.map((p: Product) => {
                                            const isLow = p.quantity <= p.minimumQuantity;
                                            return (
                                                <TableRow key={p.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="py-3.5">
                                                        <p className={`font-semibold text-sm ${isLow ? "text-red-600" : "text-slate-800"}`}>{p.name}</p>
                                                        {p.notes && <p className="text-xs text-slate-400 mt-0.5">{p.notes}</p>}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`font-bold text-sm ${isLow ? "text-red-600" : "text-slate-700"}`}>{p.quantity}</span>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm text-slate-600 font-medium">{p.minimumQuantity}</TableCell>
                                                    <TableCell className="text-sm text-slate-600 font-medium">{formatExpiration(p.expirationDate)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <GerenciarEstoqueModal
                                                                initialTab="alterar"
                                                                singleProduct={p}
                                                                onSuccess={() => { toast.success("Estoque atualizado!"); refresh(); }}
                                                                trigger={
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold cursor-pointer">
                                                                        Dar baixa
                                                                    </Button>
                                                                }
                                                            />
                                                            <GerenciarEstoqueModal
                                                                initialTab="cadastrar"
                                                                editProduct={p}
                                                                onSuccess={() => { toast.success("Produto atualizado!"); refresh(); }}
                                                                trigger={
                                                                    <Button variant="ghost" size="icon-sm" className="cursor-pointer" title="Editar">
                                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                                    </Button>
                                                                }
                                                            />
                                                            <DeleteDialogGeneric
                                                                id={p.id}
                                                                onDelete={handleDelete}
                                                                onSuccess={refresh}
                                                                title="Excluir produto?"
                                                                description={`O produto "${p.name}" será removido permanentemente.`}
                                                                successMessage="Produto removido!"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            {Math.ceil(prodTotal / LIMIT) > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-xs text-slate-400">
                                        {prodTotal} produto(s) — página {prodPage} de {Math.ceil(prodTotal / LIMIT)}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={prodPage === 1 || isPending} onClick={() => fetchProducts(prodPage - 1, prodSearch)}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" disabled={prodPage >= Math.ceil(prodTotal / LIMIT) || isPending} onClick={() => fetchProducts(prodPage + 1, prodSearch)}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        const csv = ["Produto,Em estoque,Qtd. mínima,Validade,Observações",
                                            ...products.map((p: any) => `"${p.name}",${p.quantity},${p.minimumQuantity},"${formatExpiration(p.expirationDate)}","${p.notes ?? ""}"`),
                                        ].join("\n");
                                        const a = document.createElement("a");
                                        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                                        a.download = "produtos.csv";
                                        a.click();
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" /> Exportar Lista
                                </button>
                            </div>
                        </>
                    )}

                    {tab === "historico" && (
                        <>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Pesquisar por produto"
                                        value={movSearch}
                                        onChange={(e) => setMovSearch(e.target.value)}
                                        className="pl-9 h-10 bg-white"
                                    />
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100">
                                        <TableHead className="text-slate-500 font-semibold text-xs">Produto</TableHead>
                                        <TableHead className="text-slate-500 font-semibold text-xs text-center">Quantidade</TableHead>
                                        <TableHead className="text-slate-500 font-semibold text-xs">Tipo de movimento</TableHead>
                                        <TableHead className="text-slate-500 font-semibold text-xs">Observação</TableHead>
                                        <TableHead className="text-slate-500 font-semibold text-xs">Quem realizou</TableHead>
                                        <TableHead className="text-slate-500 font-semibold text-xs">Data</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-slate-400 py-10 text-sm">
                                                Nenhuma movimentação registrada.
                                            </TableCell>
                                        </TableRow>
                                    ) : movements.map((m: StockMovement) => (
                                        <TableRow key={m.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-semibold text-sm text-slate-800 py-3.5">{m.productName}</TableCell>
                                            <TableCell className="text-center font-medium text-sm text-slate-700">{m.quantity ?? "—"}</TableCell>
                                            <TableCell className="text-sm text-slate-600">{m.type}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{m.notes ?? ""}</TableCell>
                                            <TableCell className="text-sm text-slate-600">{m.performedBy}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{formatDate(m.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {Math.ceil(movTotal / LIMIT) > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-xs text-slate-400">
                                        {movTotal} movimentação(ões) — página {movPage} de {Math.ceil(movTotal / LIMIT)}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={movPage === 1 || isPending} onClick={() => fetchMovements(movPage - 1, movSearch)}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" disabled={movPage >= Math.ceil(movTotal / LIMIT) || isPending} onClick={() => fetchMovements(movPage + 1, movSearch)}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        const csv = ["Produto,Quantidade,Tipo,Observação,Quem realizou,Data",
                                            ...movements.map((m: StockMovement) => `"${m.productName}","${m.quantity ?? "-"}","${m.type}","${m.notes ?? ""}","${m.performedBy}","${formatDate(m.createdAt)}"`),
                                        ].join("\n");
                                        const a = document.createElement("a");
                                        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                                        a.download = "movimentacoes.csv";
                                        a.click();
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" /> Exportar Lista
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <GerenciarEstoqueModal
                open={gerenciarOpen}
                onOpenChange={setGerenciarOpen}
                products={products}
                onSuccess={() => { toast.success("Operação realizada!"); refresh(); }}
            />
        </div>
    );
}
