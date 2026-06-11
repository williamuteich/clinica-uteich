"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    HeartPulse,
    AlertTriangle,
    Pill,
    ShieldCheck,
    Plus,
    Trash2,
    Save,
    Loader2
} from "lucide-react";
import { IAnamneseDisease, IAnamneseAllergy, IContinuousMedication } from "@/src/types/dashboard/anamnese";
import { IAnamnese } from "@/src/types/dashboard/anamnese";
import { saveAnamnesePaciente } from "@/src/services/anamnese";

type AnamneseFormProps = {
    patientId: string;
    initialAnamnese: IAnamnese | null;
};

export default function AnamneseForm({ patientId, initialAnamnese }: AnamneseFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [requiresMedicalClearance, setRequiresMedicalClearance] = useState(initialAnamnese?.requiresMedicalClearance ?? false);
    const [doctorRecommendations, setDoctorRecommendations] = useState(initialAnamnese?.doctorRecommendations ?? "");
    const [panicOrBehaviorNotes, setPanicOrBehaviorNotes] = useState(initialAnamnese?.panicOrBehaviorNotes ?? "");
    const [observations, setObservations] = useState(initialAnamnese?.observations ?? "");

    const [diseases, setDiseases] = useState<Omit<IAnamneseDisease, "id" | "anamneseId">[]>(initialAnamnese?.diseases ?? []);
    const [allergies, setAllergies] = useState<Omit<IAnamneseAllergy, "id" | "anamneseId">[]>(initialAnamnese?.allergies ?? []);
    const [medications, setMedications] = useState<Omit<IContinuousMedication, "id" | "anamneseId">[]>(initialAnamnese?.medications ?? []);

    const addDisease = () => {
        setDiseases(prev => [...prev, { name: "", observations: "" }]);
    };

    const updateDisease = (index: number, field: "name" | "observations", value: string) => {
        setDiseases(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeDisease = (index: number) => {
        setDiseases(prev => prev.filter((_, i) => i !== index));
    };

    const addAllergy = () => {
        setAllergies(prev => [...prev, { substance: "", reaction: "" }]);
    };

    const updateAllergy = (index: number, field: "substance" | "reaction", value: string) => {
        setAllergies(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeAllergy = (index: number) => {
        setAllergies(prev => prev.filter((_, i) => i !== index));
    };

    const addMedication = () => {
        setMedications(prev => [...prev, { medication: "", dosage: "", frequency: "", medicalFollowUp: "" }]);
    };

    const updateMedication = (index: number, field: "medication" | "dosage" | "frequency" | "medicalFollowUp", value: string) => {
        setMedications(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeMedication = (index: number) => {
        setMedications(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const hasEmptyDiseaseName = diseases.some(d => !d.name.trim());
        const hasEmptyAllergySubstance = allergies.some(a => !a.substance.trim());
        const hasEmptyMedicationName = medications.some(m => !m.medication.trim());

        if (hasEmptyDiseaseName || hasEmptyAllergySubstance || hasEmptyMedicationName) {
            toast.error("Por favor, preencha os nomes das doenças, alergias ou medicamentos adicionados.");
            return;
        }

        startTransition(async () => {
            try {
                const payload = {
                    requiresMedicalClearance,
                    doctorRecommendations: doctorRecommendations.trim() || undefined,
                    panicOrBehaviorNotes: panicOrBehaviorNotes.trim() || undefined,
                    observations: observations.trim() || undefined,
                    diseases: diseases.map(d => ({ name: d.name.trim(), observations: d.observations?.trim() || undefined })),
                    allergies: allergies.map(a => ({ substance: a.substance.trim(), reaction: a.reaction?.trim() || undefined })),
                    medications: medications.map(m => ({
                        medication: m.medication.trim(),
                        dosage: m.dosage?.trim() || undefined,
                        frequency: m.frequency?.trim() || undefined,
                        medicalFollowUp: m.medicalFollowUp?.trim() || undefined
                    })),
                };

                const response = await saveAnamnesePaciente(patientId, payload);
                if (response.success) {
                    toast.success("Ficha de anamnese médica salva no prontuário!");
                    router.refresh();
                } else {
                    toast.error(response.error || "Erro ao salvar as informações clínicas.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Erro de comunicação com o servidor.");
            }
        });
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 w-full animate-in fade-in duration-300">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-rose-600" />
                        Anamnese & Histórico Clínico
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Gerencie doenças sistêmicas, alergias, medicação de uso contínuo e alertas cirúrgicos críticos.
                    </p>
                </div>

                {(diseases.length > 0 || allergies.length > 0 || requiresMedicalClearance) && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                        PACIENTE COM PONTOS DE ATENÇÃO
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 flex flex-col min-h-[220px]">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <HeartPulse className="h-4 w-4 text-rose-500" />
                            Condições Clínicas
                        </span>
                        <Button type="button" size="icon-xs" variant="ghost" onClick={addDisease} className="h-7 w-7 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {diseases.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-white/50">
                            <p className="text-[10px] font-medium text-slate-400">Nenhuma doença registrada.</p>
                            <Button type="button" variant="link" onClick={addDisease} className="text-[10px] text-rose-600 font-bold h-auto p-0 mt-1">
                                Adicionar primeira
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {diseases.map((disease, idx) => (
                                <div key={idx} className="bg-white border rounded-lg p-2.5 shadow-xs relative group flex flex-col gap-1.5">
                                    <button type="button" onClick={() => removeDisease(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="space-y-1 pr-6">
                                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Doença / Condição</Label>
                                        <Input value={disease.name} onChange={(e) => updateDisease(idx, "name", e.target.value)} placeholder="Ex: Hipertensão, Diabetes..." className="h-7 text-xs bg-slate-50 border-none font-semibold focus-visible:ring-1 focus-visible:ring-rose-500 placeholder:text-slate-300" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Observação / Cuidados</Label>
                                        <Input value={disease.observations || ""} onChange={(e) => updateDisease(idx, "observations", e.target.value)} placeholder="Ex: Controlada, toma Losartana..." className="h-7 text-xs border-slate-100 placeholder:text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 flex flex-col min-h-[220px]">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Alergias & Reações
                        </span>
                        <Button type="button" size="icon-xs" variant="ghost" onClick={addAllergy} className="h-7 w-7 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-full">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {allergies.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-white/50">
                            <p className="text-[10px] font-medium text-slate-400">Sem alergias catalogadas.</p>
                            <Button type="button" variant="link" onClick={addAllergy} className="text-[10px] text-amber-600 font-bold h-auto p-0 mt-1">
                                Registrar alergia
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {allergies.map((allergy, idx) => (
                                <div key={idx} className="bg-white border rounded-lg p-2.5 shadow-xs relative group flex flex-col gap-1.5">
                                    <button type="button" onClick={() => removeAllergy(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="space-y-1 pr-6">
                                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Substância / Alérgeno</Label>
                                        <Input value={allergy.substance} onChange={(e) => updateAllergy(idx, "substance", e.target.value)} placeholder="Ex: Penicilina, Látex, Dipirona..." className="h-7 text-xs bg-slate-50 border-none font-semibold focus-visible:ring-1 focus-visible:ring-amber-500 placeholder:text-slate-300" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Reação Sintomática</Label>
                                        <Input value={allergy.reaction || ""} onChange={(e) => updateAllergy(idx, "reaction", e.target.value)} placeholder="Ex: Urticária, Edema de glote..." className="h-7 text-xs border-slate-100 placeholder:text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 flex flex-col min-h-[220px]">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="h-4 w-4 text-blue-500" />
                            Uso Contínuo (Fármacos)
                        </span>
                        <Button type="button" size="icon-xs" variant="ghost" onClick={addMedication} className="h-7 w-7 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {medications.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-white/50">
                            <p className="text-[10px] font-medium text-slate-400">Sem uso de medicação contínua.</p>
                            <Button type="button" variant="link" onClick={addMedication} className="text-[10px] text-blue-600 font-bold h-auto p-0 mt-1">
                                Adicionar fármaco
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {medications.map((med, idx) => (
                                <div key={idx} className="bg-white border rounded-lg p-2.5 shadow-xs relative group flex flex-col gap-1.5">
                                    <button type="button" onClick={() => removeMedication(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="space-y-1 pr-6">
                                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Medicamento</Label>
                                        <Input value={med.medication} onChange={(e) => updateMedication(idx, "medication", e.target.value)} placeholder="Ex: AAS, Glifage, Rivotril..." className="h-7 text-xs bg-slate-50 border-none font-semibold focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-slate-300" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="space-y-0.5">
                                            <Label className="text-[8px] font-bold text-slate-400 uppercase">Dose</Label>
                                            <Input value={med.dosage || ""} onChange={(e) => updateMedication(idx, "dosage", e.target.value)} placeholder="Ex: 50mg" className="h-6.5 text-[11px] border-slate-100 px-1.5 placeholder:text-slate-300" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-[8px] font-bold text-slate-400 uppercase">Frequência</Label>
                                            <Input value={med.frequency || ""} onChange={(e) => updateMedication(idx, "frequency", e.target.value)} placeholder="Ex: 12h/12h" className="h-6.5 text-[11px] border-slate-100 px-1.5 placeholder:text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-[8px] font-bold text-slate-400 uppercase">Acompanhamento Médico</Label>
                                        <Input value={med.medicalFollowUp || ""} onChange={(e) => updateMedication(idx, "medicalFollowUp", e.target.value)} placeholder="Ex: Cardiologista Dr. Carlos" className="h-6.5 text-[11px] border-slate-100 placeholder:text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-3 bg-slate-50/20 border rounded-xl p-4 shadow-xs">
                    <Label htmlFor="observations" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        Observações e Anotações Gerais do Prontuário
                    </Label>
                    <textarea
                        id="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Ex: Paciente relata ansiedade leve no início da consulta..."
                        rows={5}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-300 leading-normal"
                    />
                </div>

                <div className="bg-white border rounded-xl p-4 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-3.5 transition-all select-none">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                Requer Liberação Médica?
                            </span>
                            <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                                Ative caso o paciente necessite de liberação expressa do cardiologista/médico antes de atos cirúrgicos.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={requiresMedicalClearance}
                            onChange={(e) => setRequiresMedicalClearance(e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer shadow-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                            <Label htmlFor="doctorRecommendations" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Recomendações Médicas
                            </Label>
                            <textarea
                                id="doctorRecommendations"
                                value={doctorRecommendations}
                                onChange={(e) => setDoctorRecommendations(e.target.value)}
                                placeholder="Indicações do médico..."
                                rows={2}
                                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-normal placeholder:text-slate-300"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="panicOrBehaviorNotes" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Notas de Medo / Pânico
                            </Label>
                            <textarea
                                id="panicOrBehaviorNotes"
                                value={panicOrBehaviorNotes}
                                onChange={(e) => setPanicOrBehaviorNotes(e.target.value)}
                                placeholder="Comportamento ou fobia de agulha..."
                                rows={2}
                                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-normal placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-end w-full">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 px-5 rounded-lg shadow-sm flex items-center gap-2 min-w-[160px] justify-center cursor-pointer text-xs"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Salvando Prontuário...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-3.5 w-3.5" />
                            <span>Salvar Anamnese</span>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}