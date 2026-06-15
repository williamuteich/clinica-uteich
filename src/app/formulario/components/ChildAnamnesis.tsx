"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnamneseResponseValue, AnamneseComponentProps } from "@/src/types/dashboard/anamnese";

type Question = {
    id: string;
    label: string;
    hasNotes?: boolean;
    notesPlaceholder?: string;
    type?: "yes_no" | "text" | "select";
    options?: { value: string; label: string }[];
};

const QUESTIONS: Question[] = [
    { id: "alergia", label: "Possui alguma alergia? (Como penicilinas, AAS ou outra)", hasNotes: true, notesPlaceholder: "Descreva a alergia..." },
    { id: "tratamento_medico", label: "Está em tratamento médico?", hasNotes: true, notesPlaceholder: "Qual tratamento?" },
    { id: "dor_dentes_boca", label: "Sente alguma dor nos dentes ou na boca?" },
    { id: "medicacao", label: "Está usando medicação?", hasNotes: true, notesPlaceholder: "Quais medicamentos?" },
    { id: "internado", label: "Já esteve internado?", hasNotes: true, notesPlaceholder: "Motivo e quando?" },
    { id: "hemorragia", label: "Já teve hemorragia diagnosticada?" },
    { id: "alteracao_sanguinea", label: "Possui alguma alteração sanguínea?", hasNotes: true, notesPlaceholder: "Qual alteração?" },
    { id: "diabetes", label: "Possui diabetes?" },
    { id: "asma", label: "Possui asma?" },
    { id: "anemia", label: "Possui anemia?" },
    { id: "disfuncao_hepatica", label: "Possui alguma disfunção hepática?", hasNotes: true, notesPlaceholder: "Qual disfunção?" },
    { id: "disfuncao_renal", label: "Apresenta alguma disfunção renal", hasNotes: true, notesPlaceholder: "Qual disfunção?" },
    { id: "disfuncao_respiratoria", label: "Possui alguma disfunção respiratória?", hasNotes: true, notesPlaceholder: "Qual disfunção?" },
    { id: "alteracao_ossea", label: "Possui alguma alteração óssea?" },
    { id: "doenca_transmissivel", label: "Possui alguma doença transmissível?", hasNotes: true, notesPlaceholder: "Qual doença?" },
    { id: "tratamento_psicologico", label: "Está ou esteve em tratamento psicológico?" },
    { id: "febre_reumatica", label: "Possui algum antecedente de febre reumática?" },
    { id: "endocardite", label: "Possui algum antecendente de endocardite bacteriana?" },
    { id: "outra_doenca", label: "Possui alguma outra doença/síndrome não mencionada?", hasNotes: true, notesPlaceholder: "Qual doença ou síndrome?" },
    { id: "alergia_anestesia", label: "Já sofreu alguma reação alérgica ao receber anestesia?", hasNotes: true, notesPlaceholder: "Detalhes..." },
    { id: "dificuldade_abrir_boca", label: "Tem dificuldade de abrir a boca?" },
    { id: "dores_cabeca_nuca", label: "Sente dores no ouvido, cabeça, face, nuca ou pescoço?" },
    { id: "problema_gastrico", label: "Possui azia, má digestão, refluxo, úlcera ou gastrite?" },
    { id: "sangramento_escovacao", label: "Apresenta sangramento a escovação?" },
    { id: "sensibilidade_temperatura", label: "Seus dentes são sensíveis a mudança de temperatura ou a alimentos doces?" },
    { id: "range_dentes", label: "Range os dentes?" },
    { id: "cirurgia_oral", label: "Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)?" },
    { id: "ortodontia", label: "Já se submeteu à Ortodontia (aparelhos e correção)?" },
    { id: "periodontia", label: "Já se submeteu à Periodontia (tratamento gengival)?" },
    { id: "endodontia", label: "Já se submeteu à Endodontia (tratamento de canal)?" },

    { id: "ultima_consulta", label: "Quando foi sua última vez que veio ao dentista? Como foi o atendimento?", type: "text", notesPlaceholder: "Ex: Há 6 meses, profilaxia de rotina" },
    { id: "escovacoes_diarias", label: "Quantas vezes por dia escova os dentes?", type: "text", notesPlaceholder: "Ex: 3 vezes" },

    { id: "creme_dental", label: "Usa creme dental?" },
    { id: "fio_dental", label: "Usa fio dental?" },
    { id: "antisseptico_bucal", label: "Faz uso de antisséptico bucal?" },
    { id: "come_doces", label: "Come muitos doces, balas entre outros?" },
    { id: "toma_cafe", label: "Tem hábito de tomar café ou refrigerantes?" },
    { id: "roer_unha", label: "Tem o hábito de roer unha ou morder objetos (lápis, caneta, etc.)?" },

    {
        id: "tipo_parto",
        label: "A criança nasceu com parto normal ou cesariana?",
        type: "select",
        options: [
            { value: "NORMAL", label: "Parto Normal" },
            { value: "CESARIANA", label: "Cesariana" },
            { value: "OUTRO", label: "Outro" }
        ]
    },
    { id: "peso_nascer", label: "Peso ao nascer?", type: "text", notesPlaceholder: "Ex: 3.2 kg" },
    { id: "aleitamento_materno", label: "Realiza(ou) aleitamento materno?" },
    { id: "mamadeira_chupeta", label: "Realiza(ou) o uso de mamadeira ou chupeta?" },

    { id: "alteracao_lingua", label: "Apresenta alguma alteração de língua, lábio e/ou palato?" },
    { id: "outra_alteracao_face", label: "Apresenta outra alteração na face não mencionada?", hasNotes: true, notesPlaceholder: "Qual alteração?" }
];

export default function ChildAnamnesis({
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
                        const current = responses[q.id] || { answer: "", notes: "" };

                        if (q.type === "text") {
                            return (
                                <div key={q.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2">
                                    <Label className="text-sm font-semibold text-slate-705 leading-snug">
                                        {q.label}
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder={q.notesPlaceholder || "Responda aqui..."}
                                        value={current.answer}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        disabled={disabled}
                                        className="h-10 text-sm focus-visible:ring-blue-500 bg-white"
                                    />
                                </div>
                            );
                        }

                        if (q.type === "select") {
                            return (
                                <div key={q.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <Label className="text-sm font-semibold text-slate-705 leading-snug flex-1">
                                        {q.label}
                                    </Label>
                                    <Select
                                        value={current.answer}
                                        onValueChange={(val) => handleAnswerChange(q.id, val)}
                                        disabled={disabled}
                                    >
                                        <SelectTrigger className="w-full md:w-56 h-10 text-sm bg-white border border-slate-200">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {q.options?.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        }

                        return (
                            <div key={q.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <Label className="text-sm font-semibold text-slate-705 leading-snug flex-1">
                                        {q.label}
                                    </Label>

                                    <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shrink-0">
                                        {(["SIM", "NAO", "NAO_SEI"] as const).map((opt) => {
                                            const isSelected = current.answer === opt;
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

                                {q.hasNotes && current.answer === "SIM" && (
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

            <div className="border-t border-slate-100 pt-6">
                <Label htmlFor="informacoes-adicionais" className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                    Informações Adicionais:
                </Label>
                <Textarea
                    id="informacoes-adicionais"
                    placeholder="Algum outro detalhe importante que gostaria de compartilhar?"
                    value={responses["informacoes_adicionais"]?.answer || ""}
                    onChange={(e) => handleAnswerChange("informacoes_adicionais", e.target.value)}
                    disabled={disabled}
                    className="min-h-[80px] text-sm focus-visible:ring-blue-500"
                />
            </div>
        </div>
    );
}
