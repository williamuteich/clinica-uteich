"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";

import { Treatment } from "@/src/types/dashboard/plano-tratamento";
import { createTreatment, deleteTreatment } from "@/src/services/plano-tratamento";
import { TreatmentRow } from "./treatment-row";
import { SearchInput } from "@/src/app/components/admin/search-input";
import { LoadMoreButton } from "@/src/app/components/admin/load-more-button";
import { maskCurrency, rawCurrency } from "@/src/lib/masks";

const CATEGORIES = [
    "Odontopediatria",
    "Dentística",
    "Cirurgia",
    "Prótese",
    "Prevenção",
    "Periodontia",
    "Ortodontia",
    "Implantodontia",
    "Endodontia",
    "Urgência",
    "Radiologia",
    "Testes e exames laboratoriais",
    "Outros"
];

interface PlanosTratamentoManagementProps {
    initialTreatments: Treatment[];
}

export function PlanosTratamentoManagement({ initialTreatments }: PlanosTratamentoManagementProps) {
    const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments);
    const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
    const [searchQuery, setSearchQuery] = useState<string>(" ");

    useEffect(() => {
        setSearchQuery("");
    }, []);

    const [visibleCount, setVisibleCount] = useState<number>(30);

    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState("Dentística");
    const [newValuePrivate, setNewValuePrivate] = useState("");
    const [newValuePlan, setNewValuePlan] = useState("");
    const [newActive, setNewActive] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const closeDialogRef = useRef<HTMLButtonElement>(null);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { Todos: treatments.length };
        CATEGORIES.forEach(cat => {
            counts[cat] = 0;
        });
        treatments.forEach(t => {
            if (counts[t.category] !== undefined) {
                counts[t.category]++;
            } else {
                counts["Outros"]++;
            }
        });
        return counts;
    }, [treatments]);

    const filteredTreatments = useMemo(() => {
        return treatments.filter(t => {
            const matchesCategory = selectedCategory === "Todos" || t.category === selectedCategory;
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [treatments, selectedCategory, searchQuery]);

    useEffect(() => {
        setVisibleCount(30);
    }, [selectedCategory, searchQuery]);

    const displayedTreatments = useMemo(() => {
        return filteredTreatments.slice(0, visibleCount);
    }, [filteredTreatments, visibleCount]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newCategory) {
            toast.error("Preencha o nome e selecione a categoria.");
            return;
        }

        setIsCreating(true);
        const valPrivate = rawCurrency(newValuePrivate);
        const valPlan = rawCurrency(newValuePlan);

        try {
            const res = await createTreatment({
                name: newName,
                category: newCategory,
                valuePrivate: valPrivate,
                valuePlan: valPlan,
                active: newActive,
            });

            if (!res.success || !res.data) {
                throw new Error(res.error || "Erro ao criar tratamento");
            }

            setTreatments(prev => [res.data, ...prev]);
            toast.success("Tratamento adicionado com sucesso!");

            setNewName("");
            setNewCategory("Dentística");
            setNewValuePrivate("");
            setNewValuePlan("");
            setNewActive(true);

            closeDialogRef.current?.click();
        } catch (err: any) {
            toast.error(err.message || "Erro de rede ao criar tratamento");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este tratamento?")) return;

        try {
            const res = await deleteTreatment(id);

            if (!res.success) throw new Error(res.error || "Erro ao excluir");

            setTreatments(prev => prev.filter(t => t.id !== id));
            toast.success("Tratamento excluído!");
        } catch (err: any) {
            toast.error(err.message || "Erro ao deletar procedimento.");
        }
    };

    const handleExport = () => {
        const csvRows = [
            "Procedimento,Categoria,Valor Particular,Valor Plano,Status",
            ...filteredTreatments.map(t =>
                `"${t.name.replace(/"/g, '""')}",` +
                `"${t.category}",` +
                `"${t.valuePrivate.toFixed(2)}",` +
                `"${t.valuePlan.toFixed(2)}",` +
                `"${t.active ? "Ativo" : "Inativo"}"`
            )
        ];

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `planos_tratamento_${selectedCategory.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/admin/agenda"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar para Agenda
                    </Link>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Planos de Tratamento
                    </h1>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <button className="inline-flex items-center justify-center gap-1.5 px-4 h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0">
                            <Plus className="h-4 w-4" />
                            Adicionar tratamento
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden shadow-2xl rounded-2xl bg-white">
                        <div className="bg-blue-600 px-6 py-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-black text-white">Novo Tratamento</DialogTitle>
                                    <DialogDescription className="text-xs text-blue-100 font-semibold mt-0.5">
                                        Cadastre um novo procedimento e defina seus valores
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                    Nome do Tratamento <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Ex: Restauração Resina 2 Faces"
                                    className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                        Categoria <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 bg-white cursor-pointer"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={newActive}
                                            onChange={e => setNewActive(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-slate-650">Tratamento Ativo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                        Valor Particular (R$)
                                    </label>
                                    <input
                                        type="text"
                                        value={newValuePrivate}
                                        onChange={(e) => setNewValuePrivate(maskCurrency(e.target.value))}
                                        placeholder="0,00"
                                        className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                        Valor do Plano (R$)
                                    </label>
                                    <input
                                        type="text"
                                        value={newValuePlan}
                                        onChange={(e) => { setNewValuePlan(maskCurrency(e.target.value)); }}
                                        placeholder="0,00"
                                        className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-3">
                                <DialogClose asChild>
                                    <button
                                        ref={closeDialogRef}
                                        type="button"
                                        className="flex-1 h-10 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
                                    >
                                        Cancelar
                                    </button>
                                </DialogClose>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                                >
                                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                <aside className="w-full lg:w-64 bg-white border border-slate-200 rounded-2xl p-4 shrink-0 shadow-3xs space-y-1">
                    <h3 className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Categorias
                    </h3>
                    <button
                        onClick={() => setSelectedCategory("Todos")}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategory === "Todos"
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <span>Todos</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${selectedCategory === "Todos"
                            ? "bg-blue-200/60 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                            }`}>
                            {categoryCounts["Todos"]}
                        </span>
                    </button>

                    {CATEGORIES.map(cat => {
                        const count = categoryCounts[cat] || 0;
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <span className="truncate pr-2">{cat}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${isSelected
                                    ? "bg-blue-200/60 text-blue-700"
                                    : "bg-slate-100 text-slate-500"
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </aside>

                <div className="flex-1 w-full space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Procure um procedimento pelo nome..."
                        />

                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-1.5 px-4 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider shrink-0 w-full sm:w-auto justify-center"
                        >
                            <Download className="h-4 w-4" />
                            Exportar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {displayedTreatments.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium text-sm shadow-3xs">
                                Nenhum tratamento encontrado nesta categoria.
                            </div>
                        ) : (
                            displayedTreatments.map(t => (
                                <TreatmentRow
                                    key={t.id}
                                    treatment={t}
                                    onDelete={handleDelete}
                                    onUpdate={(id, updated) => {
                                        setTreatments(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
                                    }}
                                />
                            ))
                        )}
                    </div>

                    <LoadMoreButton
                        visibleCount={visibleCount}
                        totalCount={filteredTreatments.length}
                        onLoadMore={() => setVisibleCount(prev => prev + 30)}
                        itemName="tratamentos"
                    />
                </div>

            </div>
        </div>
    );
}
