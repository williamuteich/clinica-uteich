"use client";

import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Check, Plus, Trash2, Save, Loader2, Award, ClipboardCheck, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToothStatus, ToothInfo } from "@/src/types/dashboard/pacientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-odontogram/style.css";
import { saveOdontogramaPaciente } from "@/src/services/pacientes";

const Odontogram = dynamic(
    () => import("react-odontogram").then((mod) => mod.Odontogram),
    { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center text-slate-400 font-semibold animate-pulse bg-slate-50 border border-dashed rounded-xl">Carregando odontograma interativo...</div> }
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

interface CustomTooth {
    id: string;
    description: string;
    status: ToothStatus;
    notes: string;
}

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
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);

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
                            transformAttr = `translate(${x}, ${y}) scale(-1, -1) translate(${-x}, ${-y})`;
                        } else if (fdi.startsWith("4")) {
                            transformAttr = `translate(${x}, ${y}) scale(1, -1) translate(${-x}, ${-y})`;
                        }
                        if (transformAttr) textNode.setAttribute("transform", transformAttr);

                        textNode.textContent = fdi;
                        g.appendChild(textNode);
                    } catch (_) {}
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

    const handleSave = () => {
        const payloadTeeth: any[] = [];

        Object.values(teeth).forEach(t => {
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

        customTeeth.forEach(ct => {
            payloadTeeth.push({
                toothKey: ct.id,
                isCustom: true,
                customName: ct.description,
                status: ct.status,
                notes: ct.notes || null,
            });
        });

        const payload = {
            id: initialOdontogram?.id,
            patientId,
            teeth: payloadTeeth
        };

        startTransition(async () => {
            const res = await saveOdontogramaPaciente(patientId, payload);
            if (res.success) {
                toast.success("Odontograma salvo com sucesso!");
            } else {
                toast.error(res.error || "Erro ao salvar odontograma.");
            }
        });
    };

    const handleToothStatusUpdate = (status: ToothStatus) => {
        if (selectedTooth !== null) {
            setTeeth(prev => ({
                ...prev,
                [selectedTooth]: {
                    ...prev[selectedTooth],
                    status
                }
            }));
        } else if (selectedCustomToothId !== null) {
            setCustomTeeth(prev => prev.map(ct => ct.id === selectedCustomToothId ? { ...ct, status } : ct));
        }
    };

    const handleToothNoteUpdate = (notes: string) => {
        if (selectedTooth !== null) {
            setTeeth(prev => ({
                ...prev,
                [selectedTooth]: {
                    ...prev[selectedTooth],
                    notes
                }
            }));
        } else if (selectedCustomToothId !== null) {
            setCustomTeeth(prev => prev.map(ct => ct.id === selectedCustomToothId ? { ...ct, notes } : ct));
        }
    };

    const handleCustomDescriptionUpdate = (description: string) => {
        if (selectedCustomToothId !== null) {
            setCustomTeeth(prev => prev.map(ct => ct.id === selectedCustomToothId ? { ...ct, description } : ct));
        }
    };

    const addCustomTooth = () => {
        const newId = `Supranumerário #${customTeeth.length + 1}`;
        const newTooth: CustomTooth = {
            id: newId,
            description: "Dente extra detectado",
            status: "SAUDAVEL",
            notes: ""
        };
        setCustomTeeth(prev => [...prev, newTooth]);
        setSelectedTooth(null);
        setSelectedCustomToothId(newId);
        setIsSelectionOpen(true);
    };

    const removeCustomTooth = (id: string) => {
        setCustomTeeth(prev => prev.filter(ct => ct.id !== id));
        if (selectedCustomToothId === id) {
            setSelectedCustomToothId(null);
        }
    };

    const currentSelectedStatus = selectedTooth !== null
        ? teeth[selectedTooth]?.status || "SAUDAVEL"
        : selectedCustomToothId !== null
            ? customTeeth.find(ct => ct.id === selectedCustomToothId)?.status || "SAUDAVEL"
            : "SAUDAVEL";

    const currentSelectedNotes = selectedTooth !== null
        ? teeth[selectedTooth]?.notes || ""
        : selectedCustomToothId !== null
            ? customTeeth.find(ct => ct.id === selectedCustomToothId)?.notes || ""
            : "";

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
                        setIsSelectionOpen(true);
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
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-600 shrink-0" />
                        Odontograma Clínico
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Selecione um dente na representação gráfica para gerenciar seu diagnóstico e anotações.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                    <Button onClick={addCustomTooth} size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs h-9 px-4 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-350 text-indigo-700 font-semibold gap-1.5 rounded-xl cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Caso Especial
                    </Button>
                    <Button onClick={handleSave} disabled={isPending} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold h-9 px-5 rounded-xl gap-2 transition-all cursor-pointer">
                        {isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                        ) : (
                            <><Save className="h-4 w-4" /> Salvar Alterações</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {Object.entries(statusConfig).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-650">
                        <span className={cn("w-2.5 h-2.5 rounded-full border border-black/5 shrink-0", value.color)} />
                        <span>{value.label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col items-center justify-center w-full">
                <div className="w-full py-2 flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:max-h-[380px] md:[&_svg]:max-h-[480px] lg:[&_svg]:max-h-[600px] [&_svg]:mx-auto">
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

            {customTeeth.length > 0 && (
                <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800">Dentes Supranumerários e Anomalias</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {customTeeth.map((ct) => {
                            const conf = statusConfig[ct.status || "SAUDAVEL"];
                            return (
                                <div
                                    key={ct.id}
                                    onClick={() => {
                                        setSelectedCustomToothId(ct.id);
                                        setSelectedTooth(null);
                                        setIsSelectionOpen(true);
                                    }}
                                    className={cn(
                                        "border rounded-xl p-3 flex flex-col gap-1 cursor-pointer transition-all hover:shadow-xs",
                                        selectedCustomToothId === ct.id ? "border-blue-600 bg-blue-50/10" : "border-slate-100 hover:border-slate-350 bg-white"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">{ct.id}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase", conf.bgLight, conf.text)}>
                                                {conf.label}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCustomTooth(ct.id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">{ct.description}</p>
                                    {ct.notes && (
                                        <p className="text-[10px] text-slate-400 mt-1 italic border-t pt-1 border-slate-50 truncate">
                                            {ct.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Dialog open={isSelectionOpen} onOpenChange={setIsSelectionOpen}>
                <DialogContent className="sm:max-w-lg border-none p-0 overflow-hidden shadow-2xl rounded-3xl bg-slate-50">
                    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100">
                        <div className="bg-slate-900 text-white px-6 py-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                        <Stethoscope className="h-5 w-5 text-blue-450" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-black tracking-tight">
                                            {selectedTooth !== null ? `Dente #${selectedTooth}` : selectedCustomToothId}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-slate-400 mt-0.5 font-medium">
                                            {selectedTooth !== null
                                                ? (selectedTooth <= 28 ? "Arcada Superior • Maxilar" : "Arcada Inferior • Mandíbula")
                                                : "Caso Especial Supranumerário"}
                                        </DialogDescription>
                                    </div>
                                </div>
                                <Badge className={cn("font-black tracking-wider text-[10px] uppercase py-1 px-3 border-none rounded-full shadow-sm", statusConfig[currentSelectedStatus].bgLight, statusConfig[currentSelectedStatus].text)}>
                                    {statusConfig[currentSelectedStatus].label}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {selectedCustomToothId !== null && (
                                <div className="space-y-2">
                                    <Label htmlFor="customDescription" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-blue-600" />
                                        Nome / Descrição da Anomalia
                                    </Label>
                                    <Input
                                        id="customDescription"
                                        value={customTeeth.find(ct => ct.id === selectedCustomToothId)?.description || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomDescriptionUpdate(e.target.value)}
                                        placeholder="Ex: Mesiodens extra, Siso semi-incluso..."
                                        className="h-10 text-sm bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-600 font-semibold rounded-xl shadow-xs"
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                                    Diagnóstico Clínico
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(statusConfig).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleToothStatusUpdate(key as ToothStatus)}
                                            className={cn(
                                                "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm transition-all duration-205 font-bold cursor-pointer relative overflow-hidden shadow-xs",
                                                currentSelectedStatus === key
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-white border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className={cn(
                                                "w-2.5 h-2.5 rounded-full shrink-0 border border-black/5",
                                                currentSelectedStatus === key ? "bg-white" : value.color
                                            )} />
                                            <span className="truncate">{value.label}</span>
                                            {currentSelectedStatus === key && (
                                                <Check className="h-3.5 w-3.5 text-white ml-auto shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="toothNotes" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                    Anotações & Observações
                                </Label>

                                <textarea
                                    id="toothNotes"
                                    value={currentSelectedNotes}
                                    onChange={(e) => handleToothNoteUpdate(e.target.value)}
                                    placeholder="Escreva observações personalizadas aqui..."
                                    className="w-full h-24 rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-400 resize-none font-semibold text-slate-750 shadow-xs"
                                />

                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        Sugestões Rápidas (Toque para Inserir)
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {quickNotes.map((note) => (
                                            <button
                                                key={note}
                                                type="button"
                                                onClick={() => {
                                                    const separator = currentSelectedNotes ? ", " : "";
                                                    handleToothNoteUpdate(currentSelectedNotes + separator + note);
                                                }}
                                                className="px-2.5 py-1 text-[10px] font-semibold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                                            >
                                                + {note}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={() => setIsSelectionOpen(false)}
                                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
                                >
                                    Confirmar Diagnóstico
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
