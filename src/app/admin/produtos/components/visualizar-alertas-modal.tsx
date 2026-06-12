"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CalendarClock, Download } from "lucide-react";
import { VisualizarAlertasModalProps, Product } from "@/src/types/dashboard/produtos";

export function VisualizarAlertasModal({ products, initialType, trigger }: VisualizarAlertasModalProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<"low" | "expiring">(initialType);

    const lowProducts = products.filter((p: Product) => p.quantity <= p.minimumQuantity);
    const expiringProducts = products.filter((p: Product) => {
        if (!p.expirationDate) return false;
        const d = new Date(p.expirationDate);
        const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diff <= 30 && diff >= 0;
    });

    const activeList = type === "low" ? lowProducts : expiringProducts;

    const handleDownload = () => {
        const header = type === "low" 
            ? "Produto,Em estoque,Qtd. mínima,Observações"
            : "Produto,Em estoque,Validade,Observações";

        const rows = activeList.map((p: Product) => {
            const val = p.expirationDate ? new Date(p.expirationDate).toLocaleDateString("pt-BR") : "N/A";
            return type === "low"
                ? `"${p.name}",${p.quantity},${p.minimumQuantity},"${p.notes ?? ""}"`
                : `"${p.name}",${p.quantity},"${val}","${p.notes ?? ""}"`;
        });

        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", type === "low" ? "produtos_estoque_baixo.csv" : "produtos_vencimento_proximo.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            {trigger && <span onClick={() => { setType(initialType); setOpen(true); }} className="cursor-pointer">{trigger}</span>}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {type === "low" ? (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Produtos com Estoque Baixo
                                </>
                            ) : (
                                <>
                                    <CalendarClock className="h-5 w-5 text-blue-500" />
                                    Produtos com Vencimento Próximo
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs mt-1">
                            Visualizando e exportando lista de itens com alerta ativo no estoque.
                        </DialogDescription>
                        <div className="flex gap-0 border-b border-slate-200 mt-4">
                            <button
                                onClick={() => setType("low")}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${type === "low" ? "border-red-500 text-red-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                            >
                                Estoque Baixo ({lowProducts.length})
                            </button>
                            <button
                                onClick={() => setType("expiring")}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${type === "expiring" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                            >
                                Vencimento Próximo ({expiringProducts.length})
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-4">
                        <div className="border rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-xs font-semibold text-slate-500">Produto</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 text-center">Quantidade</TableHead>
                                        {type === "low" ? (
                                            <TableHead className="text-xs font-semibold text-slate-500 text-center">Qtd. Mínima</TableHead>
                                        ) : (
                                            <TableHead className="text-xs font-semibold text-slate-500">Vencimento</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-slate-400 py-8 text-sm">
                                                Nenhum produto nesta categoria de alerta.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        activeList.map((p: Product) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium text-slate-800 text-sm">{p.name}</TableCell>
                                                <TableCell className={`text-center font-bold text-sm ${type === "low" ? "text-red-600" : "text-slate-700"}`}>
                                                    {p.quantity}
                                                </TableCell>
                                                {type === "low" ? (
                                                    <TableCell className="text-center text-sm text-slate-500">{p.minimumQuantity}</TableCell>
                                                ) : (
                                                    <TableCell className="text-sm text-slate-500">
                                                        {p.expirationDate ? new Date(p.expirationDate).toLocaleDateString("pt-BR") : "N/A"}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
                                Fechar
                            </Button>
                            {activeList.length > 0 && (
                                <Button
                                    onClick={handleDownload}
                                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Exportar CSV
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
