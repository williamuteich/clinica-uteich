"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Trash2, ArrowLeft, Download, Loader2, Check, AlertCircle, X, Save } from "lucide-react";
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
import { createTreatment, updateTreatment, deleteTreatment } from "@/src/services/plano-tratamento";

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

    const handleNewValuePrivateChange = (val: string) => {
        setNewValuePrivate(val);
        const num = parseFloat(val.replace(",", "."));
        if (!isNaN(num)) {
            const planVal = Math.round(num * 0.8 * 100) / 100;
            setNewValuePlan(planVal.toFixed(2).replace(".", ","));
        } else {
            setNewValuePlan("");
        }
    };

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
        const valPrivate = parseFloat(newValuePrivate.replace(/\./g, "").replace(",", ".")) || 0;
        const valPlan = parseFloat(newValuePlan.replace(/\./g, "").replace(",", ".")) || 0;

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
                                        onChange={e => handleNewValuePrivateChange(e.target.value)}
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
                                        onChange={e => setNewValuePlan(e.target.value)}
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
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Procure um procedimento pelo nome..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-9 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 bg-white"
                            />
                            {searchQuery.trim() !== "" && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-3.5 hover:text-slate-600 text-slate-400 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

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

                    {filteredTreatments.length > visibleCount && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 30)}
                                className="inline-flex items-center justify-center gap-1.5 px-6 h-10 border-2 border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                            >
                                Carregar mais tratamentos ({filteredTreatments.length - visibleCount} restantes)
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function TreatmentRow({
    treatment,
    onDelete,
    onUpdate,
}: {
    treatment: Treatment;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updated: Partial<Treatment>) => void;
}) {
    const [name, setName] = useState(treatment.name);
    const [category, setCategory] = useState(treatment.category);
    const [valuePrivate, setValuePrivate] = useState(treatment.valuePrivate.toFixed(2).replace(".", ","));
    const [valuePlan, setValuePlan] = useState(treatment.valuePlan.toFixed(2).replace(".", ","));
    const [active, setActive] = useState(treatment.active);

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const prevValuesRef = useRef({
        name: treatment.name,
        category: treatment.category,
        valuePrivate: treatment.valuePrivate.toFixed(2).replace(".", ","),
        valuePlan: treatment.valuePlan.toFixed(2).replace(".", ","),
        active: treatment.active,
    });

    const triggerSave = async (overrides?: { category?: string; active?: boolean }) => {
        const nextCategory = overrides?.category !== undefined ? overrides.category : category;
        const nextActive = overrides?.active !== undefined ? overrides.active : active;

        const valPrivateStr = valuePrivate;
        const valPlanStr = valuePlan;

        if (
            name === prevValuesRef.current.name &&
            nextCategory === prevValuesRef.current.category &&
            valPrivateStr === prevValuesRef.current.valuePrivate &&
            valPlanStr === prevValuesRef.current.valuePlan &&
            nextActive === prevValuesRef.current.active
        ) {
            return;
        }

        setSaveStatus("saving");
        const valPrivate = parseFloat(valPrivateStr.replace(/\./g, "").replace(",", ".")) || 0;
        const valPlan = parseFloat(valPlanStr.replace(/\./g, "").replace(",", ".")) || 0;

        try {
            const res = await updateTreatment(treatment.id, {
                name,
                category: nextCategory,
                valuePrivate: valPrivate,
                valuePlan: valPlan,
                active: nextActive,
            });

            if (!res.success || !res.data) throw new Error(res.error || "Falha ao salvar");

            onUpdate(treatment.id, res.data);

            prevValuesRef.current = {
                name,
                category: nextCategory,
                valuePrivate: valPrivateStr,
                valuePlan: valPlanStr,
                active: nextActive,
            };

            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 1500);
        } catch (err) {
            setSaveStatus("error");
            toast.error("Erro ao salvar alterações no procedimento.");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handlePrivateBlur = () => {
        if (valuePrivate !== prevValuesRef.current.valuePrivate) {
            const num = parseFloat(valuePrivate.replace(/\./g, "").replace(",", "."));
            if (!isNaN(num)) {
                const planVal = Math.round(num * 0.8 * 100) / 100;
                setValuePlan(planVal.toFixed(2).replace(".", ","));
            }
        }
        triggerSave();
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs hover:border-slate-300 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">

                <div className="sm:col-span-6">
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1 sm:hidden">
                        Tratamento
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => triggerSave()}
                        className="w-full h-10 px-3 text-xs border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-bold text-slate-800 bg-white"
                        placeholder="Nome do procedimento"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1 sm:hidden">
                        Categoria
                    </label>
                    <select
                        value={category}
                        onChange={e => {
                            setCategory(e.target.value);
                            triggerSave({ category: e.target.value });
                        }}
                        className="w-full h-10 px-2.5 text-xs border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-bold text-slate-700 bg-white cursor-pointer"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-1.5 col-span-6">
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        R$ Particular
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={valuePrivate}
                            onChange={e => setValuePrivate(e.target.value)}
                            onBlur={handlePrivateBlur}
                            className="w-full h-10 px-2.5 text-xs border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-mono text-slate-800 bg-white"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div className="sm:col-span-1.5 col-span-6">
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        R$ Plano
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={valuePlan}
                            onChange={e => setValuePlan(e.target.value)}
                            onBlur={() => triggerSave()}
                            className="w-full h-10 px-2.5 text-xs border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-mono text-slate-800 bg-white"
                            placeholder="0,00"
                        />
                    </div>
                </div>

            </div>

            <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-3">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={e => {
                                setActive(e.target.checked);
                                triggerSave({ active: e.target.checked });
                            }}
                            className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 cursor-pointer"></div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${active ? "text-blue-600" : "text-slate-450"}`}>
                            {active ? "Ativo" : "Inativo"}
                        </span>
                    </label>

                    {saveStatus === "saving" && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Salvando...
                        </span>
                    )}
                    {saveStatus === "saved" && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                            <Check className="h-3 w-3" />
                            Salvo!
                        </span>
                    )}
                    {saveStatus === "error" && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-wider">
                            <AlertCircle className="h-3 w-3" />
                            Erro ao salvar
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {(
                        name !== prevValuesRef.current.name ||
                        category !== prevValuesRef.current.category ||
                        valuePrivate !== prevValuesRef.current.valuePrivate ||
                        valuePlan !== prevValuesRef.current.valuePlan ||
                        active !== prevValuesRef.current.active
                    ) && (
                            <button
                                onClick={() => triggerSave()}
                                disabled={saveStatus === "saving"}
                                className="inline-flex items-center gap-1 h-7 px-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-black rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                                <Save className="h-3 w-3" />
                                Salvar
                            </button>
                        )}

                    <button
                        onClick={() => onDelete(treatment.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer"
                        title="Excluir procedimento"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
