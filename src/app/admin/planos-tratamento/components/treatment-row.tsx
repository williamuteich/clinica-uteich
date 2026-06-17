"use client";

import { useState, useRef } from "react";
import { Loader2, Check, AlertCircle, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Treatment } from "@/src/types/dashboard/plano-tratamento";
import { updateTreatment } from "@/src/services/plano-tratamento";

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

interface TreatmentRowProps {
    treatment: Treatment;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updated: Partial<Treatment>) => void;
}

export function TreatmentRow({ treatment, onDelete, onUpdate }: TreatmentRowProps) {
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
                        <span className={`text-[10px] font-black uppercase tracking-wider ${active ? "text-blue-600" : "text-slate-455"}`}>
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
