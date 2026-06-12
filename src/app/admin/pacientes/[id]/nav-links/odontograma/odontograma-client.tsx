"use client";

import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import { Stethoscope, Plus, Loader2, Sparkles, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToothStatus, ToothInfo } from "@/src/types/dashboard/pacientes";
import { CustomTooth } from "@/src/types/dashboard/odontograma";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-odontogram/style.css";
import { CustomTeethList } from "./components/custom-teeth-list";
import { saveOdontogramaPaciente } from "@/src/services/odontograma";

const Odontogram = dynamic(
    () => import("react-odontogram").then((mod) => mod.Odontogram),
    { ssr: false, loading: () => <div className="h-[200px] flex items-center justify-center text-slate-400 font-semibold animate-pulse bg-slate-50 border border-dashed rounded-xl">Carregando odontograma interativo...</div> }
);

export const statusConfig = {
    SAUDAVEL: { label: "Saudável", color: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-700", bgLight: "bg-emerald-50/60", fill: "#ffffff", stroke: "#94a3b8" },
    CARIE: { label: "Cárie", color: "bg-rose-500", border: "border-rose-500", text: "text-rose-700", bgLight: "bg-rose-50/60", fill: "#ef4444", stroke: "#b91c1c" },
    ENDODONTIA: { label: "Endodontia", color: "bg-blue-500", border: "border-blue-500", text: "text-blue-700", bgLight: "bg-blue-50/60", fill: "#3b82f6", stroke: "#1d4ed8" },
    PROTESE: { label: "Prótese", color: "bg-violet-500", border: "border-violet-500", text: "text-violet-700", bgLight: "bg-violet-50/60", fill: "#a855f7", stroke: "#7e22ce" },
    IMPLANTE: { label: "Implante", color: "bg-amber-500", border: "border-amber-500", text: "text-amber-700", bgLight: "bg-amber-50/60", fill: "#f59e0b", stroke: "#b45309" },
    EXTRAIDO: { label: "Extraído", color: "bg-slate-400", border: "border-slate-400", text: "text-slate-700", bgLight: "bg-slate-100", fill: "#cbd5e1", stroke: "#475569" },
    RETIDO: { label: "Retido", color: "bg-orange-500", border: "border-orange-500", text: "text-orange-700", bgLight: "bg-orange-50/60", fill: "#f97316", stroke: "#c2410c" },
    OUTRO: { label: "Outro", color: "bg-indigo-500", border: "border-indigo-500", text: "text-indigo-700", bgLight: "bg-indigo-50/60", fill: "#6366f1", stroke: "#4338ca" },
} satisfies Record<ToothStatus, { label: string; color: string; border: string; text: string; bgLight: string; fill: string; stroke: string }>;

const upperTeethRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperTeethLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerTeethLeft = [38, 37, 36, 35, 34, 33, 32, 31];
const lowerTeethRight = [41, 42, 43, 44, 45, 46, 47, 48];

const quickNotes = [
    "Cárie ativa detectada",
    "Tratamento de canal indicado",
    "Restauração infiltrada",
    "Perda de elemento dentário",
    "Implante integrado",
    "Prótese provisória instalada",
    "Presença de tártaro",
    "Sensibilidade ao toque"
];

export default function OdontogramaClient({ patientId, initialOdontogram }: { patientId: string, initialOdontogram: any }) {
    const [isPending, startTransition] = useTransition();

    const [teeth, setTeeth] = useState<Record<number, ToothInfo>>(() => {
        const initial: Record<number, ToothInfo> = {};
        const allTeeth = [...upperTeethRight, ...upperTeethLeft, ...lowerTeethLeft, ...lowerTeethRight];
        allTeeth.forEach(t => {
            initial[t] = { id: t, status: "SAUDAVEL", notes: "" };
        });

        if (initialOdontogram && initialOdontogram.teeth) {
            initialOdontogram.teeth.forEach((t: any) => {
                if (!t.isCustom && t.toothKey && !isNaN(Number(t.toothKey))) {
                    initial[Number(t.toothKey)] = {
                        id: Number(t.toothKey),
                        status: t.status as ToothStatus,
                        notes: t.notes || ""
                    };
                }
            });
        }
        return initial;
    });

    const [customTeeth, setCustomTeeth] = useState<CustomTooth[]>(() => {
        if (initialOdontogram && initialOdontogram.teeth) {
            return initialOdontogram.teeth
                .filter((t: any) => t.isCustom)
                .map((t: any) => ({
                    id: t.toothKey,
                    description: t.customName || "Dente extra",
                    status: t.status as ToothStatus,
                    notes: t.notes || ""
                }));
        }
        return [];
    });

    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [selectedCustomToothId, setSelectedCustomToothId] = useState<string | null>(null);

    const [tempStatus, setTempStatus] = useState<ToothStatus>("SAUDAVEL");
    const [tempNotes, setTempNotes] = useState<string>("");
    const [tempCustomDescription, setTempCustomDescription] = useState<string>("");

    useEffect(() => {
        let attempts = 0;

        const injectNumbers = () => {
            const svg = document.querySelector(".Odontogram svg");
            if (!svg) return false;

            const teethGroups = svg.querySelectorAll("g[class]");
            let found = 0;

            teethGroups.forEach((g) => {
                let fdi = "";
                g.classList.forEach((cls) => {
                    if (cls.startsWith("teeth-")) fdi = cls.replace("teeth-", "");
                });
                if (!fdi) return;
                found++;

                const coloredPath = g.querySelector('[data-colored="true"]');
                const fillColor = coloredPath !== null ? "#ffffff" : "#334155";

                const existingLabel = g.querySelector(".tooth-num-label");
                if (existingLabel) {
                    existingLabel.setAttribute("fill", fillColor);
                    return;
                }

                if (typeof (g as SVGGraphicsElement).getBBox === "function") {
                    try {
                        const bbox = (g as SVGGraphicsElement).getBBox();
                        if (bbox.width === 0 && bbox.height === 0) return;

                        const x = bbox.x + bbox.width / 2;
                        const y = bbox.y + bbox.height / 2;

                        const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        textNode.setAttribute("x", x.toString());
                        textNode.setAttribute("y", (y + 5).toString());
                        textNode.setAttribute("text-anchor", "middle");
                        textNode.setAttribute("dominant-baseline", "middle");
                        textNode.setAttribute("font-size", "16");
                        textNode.setAttribute("font-weight", "700");
                        textNode.setAttribute("font-family", "system-ui, sans-serif");
                        textNode.setAttribute("fill", fillColor);
                        textNode.setAttribute("class", "tooth-num-label");
                        textNode.style.pointerEvents = "none";

                        let transformAttr = "";
                        if (fdi.startsWith("2")) {
                            transformAttr = `translate(${x}, ${y}) scale(-1, 1) translate(${-x}, ${-y})`;
                        } else if (fdi.startsWith("3")) {
                            transformAttr = `translate(${x}, ${y}) scale(1, -1) translate(${-x}, ${-y})`;
                        } else if (fdi.startsWith("4")) {
                            transformAttr = `translate(${x}, ${y}) scale(-1, -1) translate(${-x}, ${-y})`;
                        }
                        if (transformAttr) textNode.setAttribute("transform", transformAttr);

                        textNode.textContent = fdi;
                        g.appendChild(textNode);
                    } catch (_) { }
                }
            });

            return found > 0;
        };

        const interval = setInterval(() => {
            attempts++;
            const done = injectNumbers();
            if (done || attempts > 40) clearInterval(interval);
        }, 100);

        return () => clearInterval(interval);
    }, [teeth]);

    const triggerSave = (updatedTeeth = teeth, updatedCustomTeeth = customTeeth) => {
        const payloadTeeth: any[] = [];

        Object.values(updatedTeeth).forEach(t => {
            if (t.status !== "SAUDAVEL" || (t.notes && t.notes.trim() !== "")) {
                payloadTeeth.push({
                    toothKey: t.id.toString(),
                    isCustom: false,
                    customName: null,
                    status: t.status,
                    notes: t.notes || null,
                });
            }
        });

        updatedCustomTeeth.forEach(ct => {
            payloadTeeth.push({
                toothKey: ct.id,
                isCustom: true,
                customName: ct.description,
                status: ct.status,
                notes: ct.notes || null,
            });
        });

        const payload = {
            id: initialOdontogram?.id || undefined,
            teeth: payloadTeeth
        };

        startTransition(async () => {
            const res = await saveOdontogramaPaciente(patientId, payload);
            if (!res.success) {
                toast.error(res.error || "Erro ao salvar alterações automaticamente.");
            }
        });
    };

    const handleToothStatusUpdate = (status: ToothStatus) => {
        setTempStatus(status);
    };

    const handleToothNoteUpdate = (notes: string) => {
        setTempNotes(notes);
    };

    const addCustomTooth = () => {
        const newId = `Supranumerário #${customTeeth.length + 1}`;
        setSelectedCustomToothId(newId);
        setSelectedTooth(null);

        setTempStatus("SAUDAVEL");
        setTempNotes("");
        setTempCustomDescription("Dente extra detectado");
    };

    const removeCustomTooth = (id: string) => {
        const nextCustom = customTeeth.filter(ct => ct.id !== id);
        setCustomTeeth(nextCustom);
        if (selectedCustomToothId === id) {
            setSelectedCustomToothId(null);
        }
        triggerSave(teeth, nextCustom);
    };

    const handleConfirmDiagnosis = () => {
        let updatedTeeth = teeth;
        let updatedCustomTeeth = customTeeth;

        if (selectedTooth !== null) {
            updatedTeeth = {
                ...teeth,
                [selectedTooth]: {
                    ...teeth[selectedTooth],
                    status: tempStatus,
                    notes: tempNotes
                }
            };
            setTeeth(updatedTeeth);
        } else if (selectedCustomToothId !== null) {
            const exists = customTeeth.some(ct => ct.id === selectedCustomToothId);
            if (exists) {
                updatedCustomTeeth = customTeeth.map(ct =>
                    ct.id === selectedCustomToothId
                        ? { ...ct, status: tempStatus, notes: tempNotes, description: tempCustomDescription }
                        : ct
                );
            } else {
                updatedCustomTeeth = [
                    ...customTeeth,
                    {
                        id: selectedCustomToothId,
                        description: tempCustomDescription,
                        status: tempStatus,
                        notes: tempNotes
                    }
                ];
            }
            setCustomTeeth(updatedCustomTeeth);
        }

        setSelectedTooth(null);
        setSelectedCustomToothId(null);
        triggerSave(updatedTeeth, updatedCustomTeeth);
    };

    const getTeethConditions = () => {
        const conditions: any[] = [];
        const grouped: Record<string, string[]> = {};

        Object.keys(statusConfig).forEach(status => {
            grouped[status] = [];
        });

        Object.values(teeth).forEach(t => {
            if (t.status !== "SAUDAVEL") {
                grouped[t.status].push(`teeth-${t.id}`);
            }
        });

        Object.entries(grouped).forEach(([status, teethList]) => {
            if (teethList.length > 0) {
                const conf = statusConfig[status as ToothStatus];
                conditions.push({
                    label: conf.label,
                    teeth: teethList,
                    fillColor: conf.fill,
                    outlineColor: conf.stroke
                });
            }
        });

        return conditions;
    };

    const handleOdontogramChange = (selectedTeethList: any[]) => {
        if (selectedTeethList.length > 0) {
            const lastSelected = selectedTeethList[selectedTeethList.length - 1];
            const fdi = lastSelected?.notations?.fdi;
            if (fdi) {
                const toothNumber = Number(fdi);
                if (!isNaN(toothNumber)) {
                    setTimeout(() => {
                        setSelectedTooth(toothNumber);
                        setSelectedCustomToothId(null);

                        const currentTooth = teeth[toothNumber];
                        setTempStatus(currentTooth?.status || "SAUDAVEL");
                        setTempNotes(currentTooth?.notes || "");
                    }, 0);
                }
            }
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-600 shrink-0" />
                        Odontograma Clínico
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Selecione um dente na representação gráfica para gerenciar seu diagnóstico e anotações.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                    {isPending && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 shadow-xs shrink-0 select-none">
                            <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                            <span>Salvando...</span>
                        </div>
                    )}

                    <Button onClick={addCustomTooth} size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs h-9 px-4 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-350 text-indigo-700 font-semibold gap-1.5 rounded-xl cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Caso Especial
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {Object.entries(statusConfig).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-650">
                                <span className={cn("w-2.5 h-2.5 rounded-full border border-black/5 shrink-0", value.color)} />
                                <span>{value.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center w-full">
                        <div className="w-full py-4 flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:max-h-[180px] md:[&_svg]:max-h-[420px] lg:[&_svg]:max-h-[500px] [&_svg]:mx-auto">
                            <Odontogram
                                theme="light"
                                layout="circle"
                                showHalf="full"
                                maxTeeth={8}
                                notation="FDI"
                                singleSelect={true}
                                showLabels={false}
                                showTooltip={true}
                                teethConditions={getTeethConditions()}
                                onChange={handleOdontogramChange}
                                className="mx-auto"
                                styles={{ maxWidth: "100%" }}
                            />
                        </div>
                    </div>

                    <CustomTeethList
                        customTeeth={customTeeth}
                        selectedCustomToothId={selectedCustomToothId}
                        onSelectCustomTooth={(id) => {
                            setSelectedCustomToothId(id);
                            setSelectedTooth(null);

                            const ct = customTeeth.find(x => x.id === id);
                            setTempStatus(ct?.status || "SAUDAVEL");
                            setTempNotes(ct?.notes || "");
                            setTempCustomDescription(ct?.description || "");
                        }}
                        onRemoveCustomTooth={removeCustomTooth}
                    />
                </div>

                <div className="lg:col-span-1">
                    {(selectedTooth !== null || selectedCustomToothId !== null) ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in slide-in-from-right-3 duration-200">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="text-sm font-black text-slate-800">
                                        {selectedTooth !== null ? `Dente #${selectedTooth}` : selectedCustomToothId}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                        {selectedTooth !== null
                                            ? (selectedTooth <= 28 ? "Arcada Superior • Maxilar" : "Arcada Inferior • Mandíbula")
                                            : "Caso Especial Supranumerário"}
                                    </p>
                                </div>
                                <span className={cn(
                                    "font-black tracking-wider text-[9px] uppercase py-0.5 px-2.5 rounded-full",
                                    statusConfig[tempStatus].bgLight,
                                    statusConfig[tempStatus].text
                                )}>
                                    {statusConfig[tempStatus].label}
                                </span>
                            </div>

                            {selectedCustomToothId !== null && (
                                <div className="space-y-1">
                                    <label htmlFor="customDescription" className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">
                                        Nome / Descrição da Anomalia
                                    </label>
                                    <input
                                        id="customDescription"
                                        type="text"
                                        value={tempCustomDescription}
                                        onChange={(e) => setTempCustomDescription(e.target.value)}
                                        placeholder="Ex: Mesiodens extra..."
                                        className="w-full h-10 text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-semibold rounded-xl px-3 outline-none"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">
                                    Diagnóstico Clínico
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {Object.entries(statusConfig).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleToothStatusUpdate(key as ToothStatus)}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-xl border text-[11px] font-black transition-all cursor-pointer relative overflow-hidden",
                                                tempStatus === key
                                                    ? "bg-blue-600 border-blue-600 text-white font-black"
                                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-650 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className={cn(
                                                "w-2 h-2 rounded-full shrink-0 border border-black/5",
                                                tempStatus === key ? "bg-white" : value.color
                                            )} />
                                            <span className="truncate">{value.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="toothNotes" className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">
                                    Anotações & Observações
                                </label>
                                <textarea
                                    id="toothNotes"
                                    value={tempNotes}
                                    onChange={(e) => handleToothNoteUpdate(e.target.value)}
                                    placeholder="Escreva observações clínicas..."
                                    className="w-full h-24 rounded-xl border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 resize-none font-semibold text-slate-700 shadow-xs"
                                />

                                <div className="space-y-1.5 mt-2">
                                    <div className="text-[9px] font-black text-slate-450 uppercase tracking-wider">
                                        Sugestões Rápidas (Toque para Inserir)
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto pr-1">
                                        {quickNotes.map((note) => (
                                            <button
                                                key={note}
                                                type="button"
                                                onClick={() => {
                                                    const separator = tempNotes ? ", " : "";
                                                    handleToothNoteUpdate(tempNotes + separator + note);
                                                }}
                                                className="px-2 py-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                                            >
                                                + {note}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        setSelectedTooth(null);
                                        setSelectedCustomToothId(null);
                                    }}
                                    className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Limpar Seleção
                                </button>
                                <button
                                    onClick={handleConfirmDiagnosis}
                                    className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[300px] gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <Stethoscope className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-700">
                                    Nenhum dente selecionado
                                </p>
                                <p className="text-[11px] text-slate-400 font-semibold mt-1 max-w-[200px] mx-auto leading-normal">
                                    Selecione um dente na representação gráfica para gerenciar seu diagnóstico e anotações.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
