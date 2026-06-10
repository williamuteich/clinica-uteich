"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Check, Award, ClipboardCheck, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToothStatus } from "@/src/types/dashboard/pacientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusConfig } from "../odontograma-client";
import { ToothDiagnosisModalProps } from "@/src/types/dashboard/components";

export function ToothDiagnosisModal({
    isOpen,
    onOpenChange,
    selectedTooth,
    selectedCustomToothId,
    currentSelectedStatus,
    currentSelectedNotes,
    customDescription,
    quickNotes,
    onCustomDescriptionUpdate,
    onToothStatusUpdate,
    onToothNoteUpdate,
    onConfirm
}: ToothDiagnosisModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg border-none p-0 overflow-hidden shadow-2xl rounded-3xl bg-slate-50">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-900 text-white px-6 py-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Stethoscope className="h-5 w-5 text-blue-400" />
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
                                    value={customDescription}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomDescriptionUpdate(e.target.value)}
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
                                        onClick={() => onToothStatusUpdate(key as ToothStatus)}
                                        className={cn(
                                            "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm transition-all duration-205 font-bold cursor-pointer relative overflow-hidden shadow-xs",
                                            currentSelectedStatus === key
                                                ? "bg-blue-600 border-blue-600 text-white font-bold"
                                                : "bg-white border-slate-100 hover:border-slate-350 text-slate-750 hover:bg-slate-50"
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
                                onChange={(e) => onToothNoteUpdate(e.target.value)}
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
                                                onToothNoteUpdate(currentSelectedNotes + separator + note);
                                            }}
                                            className="px-2.5 py-1 text-[10px] font-semibold text-slate-655 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                                        >
                                            + {note}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={onConfirm}
                                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
                            >
                                Confirmar Diagnóstico
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
