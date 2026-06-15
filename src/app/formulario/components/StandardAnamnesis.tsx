"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnamneseResponseValue, AnamneseComponentProps } from "@/src/types/dashboard/anamnese";

type Question = {
    id: string;
    label: string;
    hasNotes?: boolean;
    notesPlaceholder?: string;
};

const QUESTIONS: Question[] = [
    { id: "pressao_alta", label: "Tem pressão alta?" },
    { id: "alergia", label: "Possui alguma alergia? (Como penicilinas, AAS ou outra)", hasNotes: true, notesPlaceholder: "Descreva a alergia..." },
    { id: "alteracao_sanguinea", label: "Possui alguma alteração sanguínea?", hasNotes: true, notesPlaceholder: "Qual alteração?" },
    { id: "hemorragia", label: "Já teve hemorragia diagnosticada?", hasNotes: true, notesPlaceholder: "Detalhes..." },
    { id: "alteracao_cardiovascular", label: "Possui alguma alteração cardiovascular?", hasNotes: true, notesPlaceholder: "Qual alteração?" },
    { id: "diabetes", label: "Possui diabetes?" },
    { id: "asma", label: "Possui asma?" },
    { id: "anemia", label: "Possui anemia?" },
    { id: "disfuncao_hepatica", label: "Possui alguma disfunção hepática?", hasNotes: true, notesPlaceholder: "Qual disfunção?" },
    { id: "disfuncao_renal", label: "Apresenta alguma disfunção renal", hasNotes: true, notesPlaceholder: "Qual disfunção?" },
    { id: "disfuncao_respiratoria", label: "Possui alguma disfunção respiratória?", hasNotes: true, notesPlaceholder: "Qual disfunção?" },
    { id: "alteracao_ossea", label: "Possui alguma alteração óssea?" },
    { id: "doenca_transmissivel", label: "Possui alguma doença transmissível?", hasNotes: true, notesPlaceholder: "Qual doença?" },
    { id: "outra_doenca", label: "Possui alguma outra doença/síndrome não mencionada?", hasNotes: true, notesPlaceholder: "Qual doença ou síndrome?" },
    { id: "alergia_anestesia", label: "Já sofreu alguma reação alérgica ao receber anestesia?", hasNotes: true, notesPlaceholder: "Detalhes..." },
    { id: "problema_gastrico", label: "Possui azia, má digestão, refluxo, úlcera ou gastrite?" },
    { id: "dificuldade_abrir_boca", label: "Tem dificuldade de abrir a boca?" },
    { id: "febre_reumatica", label: "Possui algum antecedente de febre reumática?" },
    { id: "estalado_abrir_boca", label: "Escuta algum estalado ao abrir a boca?" },
    { id: "gravida", label: "Está grávida?" },
    { id: "amamentando", label: "Está amamentando?" },
    { id: "anticoncepcional", label: "Toma anticoncepcional?" }
];

export default function StandardAnamnesis({
    responses,
    onChange,
    queixaPrincipal,
    onQueixaChange,
    disabled = false,
}: AnamneseComponentProps) {
    const handleAnswerChange = (questionId: string, answer: string) => {
        const current = responses[questionId] || { answer: "" };
        onChange({
            ...responses,
            [questionId]: {
                ...current,
                answer,
            },
        });
    };

    const handleNotesChange = (questionId: string, notes: string) => {
        const current = responses[questionId] || { answer: "" };
        onChange({
            ...responses,
            [questionId]: {
                ...current,
                notes,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="queixa-principal" className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    Queixa Principal <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                    id="queixa-principal"
                    placeholder="O que motivou a sua consulta hoje?"
                    value={queixaPrincipal}
                    onChange={(e) => onQueixaChange(e.target.value)}
                    disabled={disabled}
                    required
                    className="min-h-[100px] text-sm focus-visible:ring-blue-500"
                />
            </div>

            <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Questionário Clínico</h3>
                <div className="space-y-4">
                    {QUESTIONS.map((q) => {
                        const current = responses[q.id] || { answer: "NAO", notes: "" };
                        const answer = current.answer || "NAO";
                        return (
                            <div key={q.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <Label className="text-sm font-semibold text-slate-705 leading-snug flex-1">
                                        {q.label}
                                    </Label>
 
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shrink-0">
                                        {(["SIM", "NAO", "NAO_SEI"] as const).map((opt) => {
                                            const isSelected = answer === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => handleAnswerChange(q.id, opt)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer select-none",
                                                        isSelected
                                                            ? opt === "SIM"
                                                                ? "bg-rose-500 text-white shadow-sm"
                                                                : opt === "NAO"
                                                                ? "bg-slate-700 text-white shadow-sm"
                                                                : "bg-slate-400 text-white shadow-sm"
                                                            : "text-slate-500 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {opt === "SIM" ? "Sim" : opt === "NAO" ? "Não" : "Não sei"}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {q.hasNotes && answer === "SIM" && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Input
                                            type="text"
                                            placeholder={q.notesPlaceholder || "Forneça mais detalhes..."}
                                            value={current.notes || ""}
                                            onChange={(e) => handleNotesChange(q.id, e.target.value)}
                                            disabled={disabled}
                                            className="h-9 text-xs focus-visible:ring-blue-500 bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
