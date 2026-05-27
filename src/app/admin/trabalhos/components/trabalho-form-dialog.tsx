"use client";

import { useState, useTransition, useCallback, ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Loader2, Plus, ClipboardList } from "lucide-react";
import { createTrabalho, updateTrabalho } from "@/src/services/trabalhos";
import { toast } from "react-toastify";
import { maskCPF } from "@/src/lib/masks";
import { Trabalho, PatientMatch } from "@/src/types/trabalho";

function toDateInputValue(dateStr?: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().slice(0, 10);
}

export function TrabalhoFormDialog({
    trabalho,
    onSuccess,
    trigger,
}: {
    trabalho?: Trabalho;
    onSuccess: () => void;
    trigger?: ReactElement;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const [cpf, setCpf] = useState(trabalho?.cpfPaciente ?? "");
    const [patientMatch, setPatientMatch] = useState<PatientMatch | null>(null);
    const [searchingPatient, setSearchingPatient] = useState(false);
    const [patientSearched, setPatientSearched] = useState(false);

    const isEdit = !!trabalho;

    const reset = () => {
        setError("");
        setCpf(trabalho?.cpfPaciente ?? "");
        setPatientMatch(null);
        setPatientSearched(false);
    };

    const searchPatient = useCallback(async (cpfValue: string) => {
        const clean = cpfValue.replace(/\D/g, "");
        if (clean.length !== 11) return;
        setSearchingPatient(true);
        try {
            const res = await fetch(`/api/admin/pacientes/busca-cpf?cpf=${clean}`);
            const data = await res.json();
            setPatientSearched(true);
            if (data.found) {
                setPatientMatch({ id: data.patient.id, name: data.patient.name, cpf: data.patient.cpf });
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);

        const payload = {
            pacienteId: patientMatch?.id ?? trabalho?.pacienteId ?? null,
            nomePaciente: patientMatch?.name ?? (fd.get("nomePaciente") as string),
            cpfPaciente: cpf || null,
            laboratorio: fd.get("laboratorio") as string,
            nomeTrabalho: fd.get("nomeTrabalho") as string,
            descricao: fd.get("descricao") as string,
            status: fd.get("status") as Trabalho["status"],
            dataEnvio: fd.get("dataEnvio") as string,
            previsaoRetorno: (fd.get("previsaoRetorno") as string) || null,
            dataRecebimento: (fd.get("dataRecebimento") as string) || null,
            dentesEnvolvidos: (fd.get("dentesEnvolvidos") as string) || null,
            valor: fd.get("valor") ? Number(fd.get("valor")) : null,
            observacoes: (fd.get("observacoes") as string) || null,
        };

        startTransition(async () => {
            const res = isEdit
                ? await updateTrabalho(trabalho.id, payload)
                : await createTrabalho(payload);

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
            <DialogTrigger render={
                trigger ?? (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-10 cursor-pointer font-semibold text-xs rounded-md">
                        <Plus className="mr-2 h-4 w-4" /> Novo Trabalho
                    </Button>
                )
            } />

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                        <ClipboardList className="h-5 w-5 text-blue-600" />
                        {isEdit ? "Editar Trabalho Protético" : "Registrar Novo Trabalho"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                        {isEdit ? "Edite as informações do trabalho." : "Preencha as informações do trabalho enviado ao laboratório."}
                    </DialogDescription>
                </DialogHeader>

                <form key={formKey} onSubmit={handleSubmit} className="space-y-4 py-2">
                    {error && (
                        <div className="p-3 text-xs font-semibold text-red-650 bg-red-50 border border-red-100 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dados do Paciente</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500">CPF do Paciente (busca automática)</Label>
                                <div className="relative">
                                    <Input
                                        value={cpf}
                                        onChange={handleCpfChange}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        className="h-10 bg-white"
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
                                        ⚠ Não cadastrado. Informe o nome abaixo.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500">Nome do Paciente *</Label>
                                <Input
                                    name="nomePaciente"
                                    defaultValue={patientMatch?.name ?? trabalho?.nomePaciente ?? ""}
                                    placeholder="Nome completo"
                                    required
                                    className="h-10 bg-white"
                                    readOnly={!!patientMatch}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laboratório Destino *</Label>
                                <Input name="laboratorio" defaultValue={trabalho?.laboratorio ?? ""} placeholder="Ex: Lab Uteich" required className="h-10 bg-white" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Trabalho *</Label>
                                <Input name="nomeTrabalho" defaultValue={trabalho?.nomeTrabalho ?? ""} placeholder="Ex: Prótese dente 11" required className="h-10 bg-white" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição *</Label>
                            <textarea
                                name="descricao"
                                defaultValue={trabalho?.descricao ?? ""}
                                placeholder="Detalhes técnicos (ex: cor A2, ombro cerâmico)..."
                                required
                                className="flex min-h-[70px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status *</Label>
                                <select
                                    name="status"
                                    defaultValue={trabalho?.status ?? "EM_ANDAMENTO"}
                                    required
                                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="EM_ANDAMENTO">Em Andamento</option>
                                    <option value="PRONTO">Pronto</option>
                                    <option value="FINALIZADO">Finalizado</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dentes Envolvidos</Label>
                                <Input name="dentesEnvolvidos" defaultValue={trabalho?.dentesEnvolvidos ?? ""} placeholder="Ex: 11, 21" className="h-10 bg-white" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Cobrado (R$)</Label>
                                <Input name="valor" type="number" step="0.01" min="0" defaultValue={trabalho?.valor ?? ""} placeholder="0,00" className="h-10 bg-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Envio *</Label>
                                <Input name="dataEnvio" type="date" defaultValue={toDateInputValue(trabalho?.dataEnvio) || new Date().toISOString().slice(0, 10)} required className="h-10 bg-white" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Previsão Retorno</Label>
                                <Input name="previsaoRetorno" type="date" defaultValue={toDateInputValue(trabalho?.previsaoRetorno)} className="h-10 bg-white" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Recebimento</Label>
                                <Input name="dataRecebimento" type="date" defaultValue={toDateInputValue(trabalho?.dataRecebimento)} className="h-10 bg-white" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observações Internas</Label>
                            <textarea
                                name="observacoes"
                                defaultValue={trabalho?.observacoes ?? ""}
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
