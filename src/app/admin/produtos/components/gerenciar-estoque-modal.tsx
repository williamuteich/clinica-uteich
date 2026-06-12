"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Minus, Loader2, Trash2 } from "lucide-react";
import { createProducts, updateProduct, adjustStock } from "@/src/services/produtos";
import { toast } from "react-toastify";
import { GerenciarEstoqueModalProps, Product, ProductTab } from "@/src/types/dashboard/produtos";

function emptyRow() {
    return { name: "", quantity: 1, minimumQuantity: 1, expirationDate: "", notes: "" };
}

export function GerenciarEstoqueModal({ open: externalOpen, onOpenChange, products = [], initialTab = "alterar", singleProduct, editProduct, onSuccess, trigger }: GerenciarEstoqueModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = (v: boolean) => { onOpenChange ? onOpenChange(v) : setInternalOpen(v); };

    const [tab, setTab] = useState<ProductTab>(editProduct ? "cadastrar" : initialTab || "alterar");
    const [isPending, startTransition] = useTransition();

    const [alterSearch, setAlterSearch] = useState("");
    const [showLow, setShowLow] = useState(false);
    const [deltas, setDeltas] = useState<Record<string, number>>({});

    const [rows, setRows] = useState<ReturnType<typeof emptyRow>[]>([emptyRow()]);

    useEffect(() => {
        if (open) {
            if (editProduct) {
                setRows([{
                    name: editProduct.name,
                    quantity: editProduct.quantity,
                    minimumQuantity: editProduct.minimumQuantity,
                    expirationDate: editProduct.expirationDate ? new Date(editProduct.expirationDate).toISOString().slice(0, 10) : "",
                    notes: editProduct.notes ?? ""
                }]);
                setTab("cadastrar");
            } else {
                setRows([emptyRow()]);
                setTab(initialTab);
            }
            setDeltas({});
        }
    }, [open, editProduct, initialTab]);

    const filteredProducts = (singleProduct ? [singleProduct] : products).filter((p) => {
        const matchSearch = !alterSearch || p.name.toLowerCase().includes(alterSearch.toLowerCase());
        const matchLow = !showLow || p.quantity <= p.minimumQuantity;
        return matchSearch && matchLow;
    });

    const setDelta = (id: string, val: number) => setDeltas((prev) => ({ ...prev, [id]: val }));

    const handleAlterar = () => {
        startTransition(async () => {
            const entries = Object.entries(deltas).filter(([, d]) => d !== 0);
            if (entries.length === 0) { toast.warning("Nenhuma alteração para salvar."); return; }

            const results = await Promise.all(entries.map(([id, delta]) => adjustStock(id, delta)));
            const errors = results.filter((r) => !r.success);
            if (errors.length > 0) { toast.error("Erro ao alterar estoque."); return; }

            setDeltas({});
            setOpen(false);
            onSuccess();
        });
    };

    const handleCadastrar = () => {
        startTransition(async () => {
            if (editProduct) {
                const row = rows[0];
                const res = await updateProduct(editProduct.id, {
                    name: row.name,
                    quantity: row.quantity,
                    minimumQuantity: row.minimumQuantity,
                    expirationDate: row.expirationDate || null,
                    notes: row.notes || null,
                });
                if (!res.success) { toast.error(res.error || "Erro ao atualizar."); return; }
            } else {
                const valid = rows.filter((r) => r.name.trim());
                if (valid.length === 0) { toast.warning("Preencha ao menos um produto."); return; }
                const res = await createProducts(valid.map((r) => ({ ...r, expirationDate: r.expirationDate || null, notes: r.notes || null })));
                if (!res.success) { toast.error(res.error || "Erro ao cadastrar."); return; }
            }
            setRows([emptyRow()]);
            setOpen(false);
            onSuccess();
        });
    };

    return (
        <>
            {trigger && <span onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</span>}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="sr-only">Gerenciar estoque</DialogTitle>
                        <DialogDescription className="sr-only">Gerencie produtos e quantidades do estoque</DialogDescription>
                        <div className="flex gap-0 border-b border-slate-200">
                            {!editProduct && (
                                <>
                                    <TabBtn active={tab === "alterar"} onClick={() => setTab("alterar")}>Alterar quantidade</TabBtn>
                                    <TabBtn active={tab === "cadastrar"} onClick={() => setTab("cadastrar")}>Cadastrar novo produto</TabBtn>
                                </>
                            )}
                            {editProduct && (
                                <TabBtn active={true} onClick={() => { }}>Editar produto</TabBtn>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-4">
                        {tab === "alterar" && (
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Pesquisar por produto" value={alterSearch} onChange={(e) => setAlterSearch(e.target.value)} className="pl-9 h-10" />
                                </div>

                                {!singleProduct && (
                                    <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                                        <div
                                            onClick={() => setShowLow((v) => !v)}
                                            className={`relative w-9 h-5 rounded-full transition-colors ${showLow ? "bg-blue-600" : "bg-slate-200"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showLow ? "translate-x-4" : ""}`} />
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">Itens com quantidade em alerta</span>
                                    </label>
                                )}

                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Produto</th>
                                                <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Em estoque</th>
                                                <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Qtd. de entrada</th>
                                                <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-xs">Nenhum produto encontrado.</td></tr>
                                            ) : filteredProducts.map((p: any) => {
                                                const d = deltas[p.id] ?? 0;
                                                return (
                                                    <tr key={p.id} className="border-t border-slate-100">
                                                        <td className="px-4 py-3">
                                                            <p className="font-semibold text-slate-800">{p.name}</p>
                                                            {p.expirationDate && <p className="text-[10px] text-slate-400">Val: {new Date(p.expirationDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</p>}
                                                        </td>
                                                        <td className="text-center font-bold text-slate-700">{p.quantity}</td>
                                                        <td className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => setDelta(p.id, d - 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer"><Minus className="h-3 w-3" /></button>
                                                                <span className="w-8 text-center font-bold text-slate-700">{d}</span>
                                                                <button onClick={() => setDelta(p.id, d + 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer"><Plus className="h-3 w-3" /></button>
                                                            </div>
                                                        </td>
                                                        <td className="text-center font-bold text-slate-700">{p.quantity + d}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-3 pt-2 border-t">
                                    <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancelar</Button>
                                    <Button onClick={handleAlterar} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Alterar estoque"}
                                    </Button>
                                </div>
                            </>
                        )}

                        {tab === "cadastrar" && (
                            <>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-[1fr_90px_90px_120px_120px_32px] gap-2 text-xs font-semibold text-slate-500 px-1">
                                        <span>Nome do produto</span>
                                        <span className="text-center">Em estoque</span>
                                        <span className="text-center flex items-center justify-center gap-1">
                                            Qtd. mínima
                                            <span
                                                title="Insira a quantidade mínima para que o sistema avise quando o produto estiver com estoque baixo."
                                                className="w-3.5 h-3.5 rounded-full bg-slate-100 hover:bg-slate-200 border text-[9px] flex items-center justify-center text-slate-500 cursor-help font-bold"
                                            >
                                                ?
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Validade
                                            <span
                                                title="Insira a validade do produto para que o sistema avise com antecedência antes do produto vencer."
                                                className="w-3.5 h-3.5 rounded-full bg-slate-100 hover:bg-slate-200 border text-[9px] flex items-center justify-center text-slate-500 cursor-help font-bold"
                                            >
                                                ?
                                            </span>
                                        </span>
                                        <span>Observação</span>
                                        <span />
                                    </div>

                                    {rows.map((row, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_90px_90px_120px_120px_32px] gap-2 items-center">
                                            <Input value={row.name} onChange={(e) => { const r = [...rows]; r[i].name = e.target.value; setRows(r); }} placeholder="Ex: Resina Fotopolimerizável A2" className="h-9 text-sm" />
                                            <Input type="number" min={0} value={row.quantity} onChange={(e) => { const r = [...rows]; r[i].quantity = Number(e.target.value); setRows(r); }} className="h-9 text-sm text-center" />
                                            <Input type="number" min={0} value={row.minimumQuantity} onChange={(e) => { const r = [...rows]; r[i].minimumQuantity = Number(e.target.value); setRows(r); }} className="h-9 text-sm text-center" />
                                            <Input type="date" value={row.expirationDate} onChange={(e) => { const r = [...rows]; r[i].expirationDate = e.target.value; setRows(r); }} className="h-9 text-sm" />
                                            <Input value={row.notes} onChange={(e) => { const r = [...rows]; r[i].notes = e.target.value; setRows(r); }} placeholder="Ex: Lote 123" className="h-9 text-sm" />
                                            <button onClick={() => rows.length > 1 && setRows(rows.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {!editProduct && (
                                        <button onClick={() => setRows([...rows, emptyRow()])} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer mt-2">
                                            <Plus className="h-4 w-4" /> Adicionar outro produto
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">Cancelar</Button>
                                    <Button onClick={handleCadastrar} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editProduct ? "Salvar alterações" : "Cadastrar produto(s)"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
            {children}
        </button>
    );
}
