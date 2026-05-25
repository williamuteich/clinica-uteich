"use client";

import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import { Stethoscope, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToothStatus, ToothInfo } from "@/src/types/dashboard/pacientes";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-odontogram/style.css";
import { saveOdontogramaPaciente } from "@/src/services/pacientes";
import { ToothDiagnosisModal } from "./components/tooth-diagnosis-modal";
import { CustomTeethList } from "./components/custom-teeth-list";

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

export interface CustomTooth {
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

    // Estados temporários para gerenciar diagnóstico em edição antes de confirmar ou cancelar
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
            id: initialOdontogram?.id,
            patientId,
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

    const handleCustomDescriptionUpdate = (description: string) => {
        setTempCustomDescription(description);
    };

    const addCustomTooth = () => {
        const newId = `Supranumerário #${customTeeth.length + 1}`;
        setSelectedCustomToothId(newId);
        setSelectedTooth(null);

        // Inicializa estado temporário para novo dente
        setTempStatus("SAUDAVEL");
        setTempNotes("");
        setTempCustomDescription("Dente extra detectado");

        setIsSelectionOpen(true);
    };

    const removeCustomTooth = (id: string) => {
        const nextCustom = customTeeth.filter(ct => ct.id !== id);
        setCustomTeeth(nextCustom);
        if (selectedCustomToothId === id) {
            setIsSelectionOpen(false);
            setSelectedCustomToothId(null);
        }
        triggerSave(teeth, nextCustom);
    };

    // Consolida diagnóstico editado temporariamente nos estados globais e salva na nuvem
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

        setIsSelectionOpen(false);
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

                        // Inicializa estados temporários com dados consolidados existentes
                        const currentTooth = teeth[toothNumber];
                        setTempStatus(currentTooth?.status || "SAUDAVEL");
                        setTempNotes(currentTooth?.notes || "");

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

                <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                    {/* Indicador de Auto-Save em Tempo Real */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 shadow-xs shrink-0 select-none">
                        {isPending ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                                <span className="text-slate-500">Sincronizando...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                </svg>
                                <span className="text-emerald-700">Alterações salvas</span>
                            </>
                        )}
                    </div>

                    <Button onClick={addCustomTooth} size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs h-9 px-4 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-350 text-indigo-700 font-semibold gap-1.5 rounded-xl cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Caso Especial
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
                <div className="w-full py-2 flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:max-h-[380px] md:[&_svg]:max-h-[500px] lg:[&_svg]:max-h-[600px] [&_svg]:mx-auto">
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

                    // Inicializa estados temporários ao clicar na lista especial
                    const ct = customTeeth.find(x => x.id === id);
                    setTempStatus(ct?.status || "SAUDAVEL");
                    setTempNotes(ct?.notes || "");
                    setTempCustomDescription(ct?.description || "");

                    setIsSelectionOpen(true);
                }}
                onRemoveCustomTooth={removeCustomTooth}
            />

            <ToothDiagnosisModal
                isOpen={isSelectionOpen}
                onOpenChange={setIsSelectionOpen}
                selectedTooth={selectedTooth}
                selectedCustomToothId={selectedCustomToothId}
                customTeeth={customTeeth}
                currentSelectedStatus={tempStatus}
                currentSelectedNotes={tempNotes}
                customDescription={tempCustomDescription}
                quickNotes={quickNotes}
                onCustomDescriptionUpdate={handleCustomDescriptionUpdate}
                onToothStatusUpdate={handleToothStatusUpdate}
                onToothNoteUpdate={handleToothNoteUpdate}
                onConfirm={handleConfirmDiagnosis}
            />
        </div>
    );
}
