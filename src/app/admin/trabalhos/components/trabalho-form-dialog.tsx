"use client";

import { useState, useTransition, useCallback, ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Loader2, Plus, FlaskConical } from "lucide-react";
import { createProtheticWork, updateProtheticWork } from "@/src/services/trabalhos";
import { toast } from "react-toastify";
import { maskCPF, maskCurrency, rawCurrency } from "@/src/lib/masks";
import { ProtheticWork, PatientMatch } from "@/src/types/dashboard/trabalho";

function toDateInputValue(dateStr?: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().slice(0, 10);
}

export function TrabalhoFormDialog({
    trabalho,
    onSuccess,
    trigger,
}: {
    trabalho?: ProtheticWork;
    onSuccess: () => void;
    trigger?: ReactElement;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const [cpf, setCpf] = useState(trabalho?.patientCpf ?? "");
    const [patientMatch, setPatientMatch] = useState<PatientMatch | null>(null);
    const [searchingPatient, setSearchingPatient] = useState(false);
    const [patientSearched, setPatientSearched] = useState(false);

    const initialValor = trabalho?.value
        ? maskCurrency(String(Math.round(trabalho.value * 100)))
        : "";
    const [valorDisplay, setValorDisplay] = useState(initialValor);

    const isEdit = !!trabalho;

    const reset = () => {
        setError("");
        setCpf(trabalho?.patientCpf ?? "");
        setPatientMatch(null);
        setPatientSearched(false);
        setValorDisplay(initialValor);
    };

    const searchPatient = useCallback(async (cpfValue: string) => {
        const clean = cpfValue.replace(/\D/g, "");
        if (clean.length !== 11) return;
        setSearchingPatient(true);
        try {
            const res = await fetch(`/api/admin/pacientes?cpf=${clean}&limit=1`);
            const data = await res.json();
            setPatientSearched(true);
            const patient = data.pacientes?.[0] ?? null;
            if (patient) {
                setPatientMatch({ id: patient.id, name: patient.name, cpf: patient.cpf });
            } else {
                setPatientMatch(null);
            }
        } catch {
            setPatientMatch(null);
        } finally {
            setSearchingPatient(false);
        }
    }, []);

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskCPF(e.target.value);
        setCpf(masked);
        setPatientSearched(false);
        setPatientMatch(null);
        if (masked.replace(/\D/g, "").length === 11) {
            searchPatient(masked);
        }
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValorDisplay(maskCurrency(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);

        const payload = {
            patientId: patientMatch?.id ?? trabalho?.patientId ?? null,
            patientName: patientMatch?.name ?? (fd.get("patientName") as string),
            patientCpf: cpf || null,
            laboratory: fd.get("laboratory") as string,
            workName: fd.get("workName") as string,
            description: fd.get("description") as string,
            status: (isEdit ? fd.get("status") as ProtheticWork["status"] : "PENDING"),
            sentAt: fd.get("sentAt") as string,
            teethInvolved: (fd.get("teethInvolved") as string) || null,
            value: valorDisplay ? rawCurrency(valorDisplay) : null,
            notes: (fd.get("notes") as string) || null,
        };

        startTransition(async () => {
            const res = isEdit
                ? await updateProtheticWork(trabalho.id, payload)
                : await createProtheticWork(payload);

            if (res.success) {
                toast.success(isEdit ? "Trabalho atualizado!" : "Trabalho registrado!");
                setOpen(false);
                reset();
                onSuccess();
            } else {
                setError(res.error || "Erro ao salvar trabalho.");
            }
        });
    };

    const formKey = `${patientMatch?.id || "empty"}-${trabalho?.id || "new"}`;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-10 cursor-pointer font-semibold text-xs rounded-md">
                        <Plus className="mr-2 h-4 w-4" /> Novo Trabalho
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                        <FlaskConical className="h-5 w-5 text-blue-600" />
                        {isEdit ? "Editar Trabalho" : "Novo Envio ao Laboratório"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                        {isEdit ? "Edite as informações do trabalho." : "Preencha as informações do trabalho enviado ao laboratório."}
                    </DialogDescription>
                </DialogHeader>

                <form key={formKey} onSubmit={handleSubmit} className="space-y-4 py-2">
                    {error && (
                        <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dados do Paciente</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500">CPF <span className="text-slate-400 font-normal">(opcional)</span></Label>
                                <div className="relative">
                                    <Input
                                        placeholder="000.000.000-00"
                                        className="h-10 bg-white w-full"
                                        value={cpf}
                                        onChange={handleCpfChange}
                                    />
                                    {searchingPatient && (
                                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-slate-400" />
                                    )}
                                </div>
                                {patientSearched && patientMatch && (
                                    <p className="text-xs text-emerald-600 font-medium">
                                        ✓ Paciente vinculado: <strong>{patientMatch.name}</strong>
                                    </p>
                                )}
                                {patientSearched && !patientMatch && (
                                    <p className="text-xs text-amber-600">
                                        ⚠ Não cadastrado.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500">Nome do Paciente *</Label>
                                <Input
                                    name="patientName"
                                    defaultValue={patientMatch?.name ?? trabalho?.patientName ?? ""}
                                    placeholder="Nome completo"
                                    required
                                    className="h-10 bg-white w-full"
                                    readOnly={!!patientMatch}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laboratório Destino *</Label>
                                <Input name="laboratory" defaultValue={trabalho?.laboratory ?? ""} placeholder="Ex: Lab Uteich" required className="h-10 bg-white w-full" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Trabalho *</Label>
                                <Input name="workName" defaultValue={trabalho?.workName ?? ""} placeholder="Ex: Prótese dente 11" required className="h-10 bg-white w-full" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição <span className="text-slate-400 font-normal normal-case">(opcional)</span></Label>
                            <textarea
                                name="description"
                                defaultValue={trabalho?.description ?? ""}
                                placeholder="Detalhes técnicos (ex: cor A2, ombro cerâmico)..."
                                className="flex min-h-[70px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {isEdit && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                                <select
                                    name="status"
                                    defaultValue={trabalho.status}
                                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="PENDING">Pendente</option>
                                    <option value="DONE">Concluído</option>
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Envio *</Label>
                                <Input
                                    name="sentAt"
                                    type="date"
                                    defaultValue={toDateInputValue(trabalho?.sentAt) || new Date().toISOString().slice(0, 10)}
                                    required
                                    className="h-10 bg-white w-full"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dentes <span className="text-slate-400 font-normal normal-case">(opcional)</span></Label>
                                <Input name="teethInvolved" defaultValue={trabalho?.teethInvolved ?? ""} placeholder="Ex: 11, 21" className="h-10 bg-white w-full" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor <span className="text-slate-400 font-normal normal-case">(opcional)</span></Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
                                    <Input
                                        className="h-10 bg-white w-full pl-8"
                                        placeholder="0,00"
                                        value={valorDisplay}
                                        onChange={handleValorChange}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observações <span className="text-slate-400 font-normal normal-case">(opcional)</span></Label>
                            <textarea
                                name="notes"
                                defaultValue={trabalho?.notes ?? ""}
                                placeholder="Ex: paciente tem pressa, cuidado ao encaixar..."
                                className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50/55 -mx-6 -mb-6 p-4 border-t flex justify-end gap-3 rounded-b-lg">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 min-w-[140px] cursor-pointer"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                                </span>
                            ) : isEdit ? "Salvar Alterações" : "Registrar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
