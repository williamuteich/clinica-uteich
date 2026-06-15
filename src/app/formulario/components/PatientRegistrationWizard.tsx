"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, CheckCircle, ShieldAlert, Sparkles, User, MapPin, ClipboardList, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StandardAnamnesis from "./StandardAnamnesis";
import OrthodonticAnamnesis from "./OrthodonticAnamnesis";
import ChildAnamnesis from "./ChildAnamnesis";
import SurgicalAnamnesis from "./SurgicalAnamnesis";
import { AnamneseResponseValue } from "@/src/types/dashboard/anamnese";
import { maskCPF, maskPhone, maskCEP } from "@/src/lib/masks";

type PatientRegistrationWizardProps = {
    patientName: string;
    formType: string;
    token: string;
    hasAnamnesis: boolean;
};

export default function PatientRegistrationWizard({
    patientName,
    formType,
    token,
    hasAnamnesis,
}: PatientRegistrationWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: patientName,
        cpf: "",
        birthDate: "",
        phone: "",
        email: "",
        profession: "",
        gender: "",
        howKnewClinic: "",
        emergencyName: "",
        emergencyPhone: "",
        representativeName: "",
        representativeCpf: "",
        representativeBirthDate: "",
        zipCode: "",
        state: "",
        city: "",
        neighborhood: "",
        street: "",
        number: "",
        complement: "",
        observations: "",
    });

    const [queixaPrincipal, setQueixaPrincipal] = useState("");
    const [responses, setResponses] = useState<Record<string, AnamneseResponseValue>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [isMinor, setIsMinor] = useState(false);
    const [hasRepresentative, setHasRepresentative] = useState(false);

    useEffect(() => {
        if (!formData.birthDate) {
            setIsMinor(false);
            return;
        }
        const birth = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        setIsMinor(age < 18);
    }, [formData.birthDate]);

    useEffect(() => {
        if (formType === "CHILD_ANAMNESIS" || isMinor) {
            setHasRepresentative(true);
        }
    }, [formType, isMinor]);

    useEffect(() => {
        const cleanCep = formData.zipCode.replace(/\D/g, "");
        if (cleanCep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
                .then((res) => res.json())
                .then((data) => {
                    if (!data.erro) {
                        setFormData((prev) => ({
                            ...prev,
                            state: data.uf,
                            city: data.localidade,
                            neighborhood: data.bairro,
                            street: data.logradouro,
                        }));
                    }
                })
                .catch(() => { });
        }
    }, [formData.zipCode]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        let masked = value;
        if (field === "cpf" || field === "representativeCpf") masked = maskCPF(value);
        if (field === "phone" || field === "emergencyPhone") masked = maskPhone(value);
        if (field === "zipCode") masked = maskCEP(value);

        setFormData((prev) => ({
            ...prev,
            [field]: masked,
        }));
    };

    const validateStep1 = () => {
        const required = ["name", "birthDate", "phone", "gender", "zipCode", "state", "city", "neighborhood", "street", "number"];
        if (formType !== "CHILD_ANAMNESIS") {
            required.push("cpf");
        }
        if (hasRepresentative) {
            required.push("representativeName", "representativeCpf", "representativeBirthDate");
        }

        for (const f of required) {
            if (!formData[f as keyof typeof formData]) return false;
        }
        return true;
    };

    const validateStep2 = () => {
        return queixaPrincipal.trim().length > 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep1()) {
            setSubmitError("Por favor, preencha todos os campos obrigatórios dos Dados Pessoais.");
            setStep(1);
            return;
        }

        if (hasAnamnesis && !validateStep2()) {
            setSubmitError("Por favor, descreva sua queixa principal.");
            setStep(2);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch(`/api/formulario/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formData,
                    queixaPrincipal,
                    responses,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSubmitError(data.error || "Ocorreu um erro ao enviar seu cadastro.");
            } else {
                setIsSuccess(true);
            }
        } catch (error) {
            console.error(error);
            setSubmitError("Erro ao se conectar com o servidor. Tente novamente mais tarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner mb-2">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastro enviado com sucesso!</h1>
                <p className="text-sm text-slate-500 max-w-sm">
                    Agradecemos a sua colaboração. Seus dados já estão salvos no sistema da clínica.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-all">
            <div className="bg-slate-900 hidden text-white p-8 md:w-80 md:flex flex-col justify-between shrink-0">
                <div className="space-y-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-wide uppercase">Uteich</h2>
                            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Odontologia</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 1 ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20" : "bg-slate-800 text-slate-400"}`}>
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Passo 1</p>
                                <h3 className="text-sm font-bold text-white">Dados Pessoais</h3>
                            </div>
                        </div>

                        {hasAnamnesis && (
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 2 ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20" : "bg-slate-800 text-slate-400"}`}>
                                    <ClipboardList className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400">Passo 2</p>
                                    <h3 className="text-sm font-bold text-white">Anamnese</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    Seus dados estão protegidos por criptografia de ponta a ponta em conformidade com as normas clínicas vigentes.
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
                <div>
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    Informações Cadastrais
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Insira seus dados pessoais e informações de contato.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Nome Completo <span className="text-rose-500">*</span></Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Ex: João da Silva"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">
                                        CPF {formType !== "CHILD_ANAMNESIS" && <span className="text-rose-500">*</span>}
                                    </Label>
                                    <Input
                                        value={formData.cpf}
                                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required={formType !== "CHILD_ANAMNESIS"}
                                        maxLength={14}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Data de Nascimento <span className="text-rose-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Telefone / WhatsApp <span className="text-rose-500">*</span></Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
                                        maxLength={15}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">E-mail</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="Ex: joao@email.com"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Profissão</Label>
                                    <Input
                                        value={formData.profession}
                                        onChange={(e) => handleInputChange("profession", e.target.value)}
                                        placeholder="Ex: Engenheiro"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Gênero <span className="text-rose-500">*</span></Label>
                                    <Select value={formData.gender} onValueChange={(val) => handleInputChange("gender", val)}>
                                        <SelectTrigger className="h-10 text-sm">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MASCULINO">Masculino</SelectItem>
                                            <SelectItem value="FEMININO">Feminino</SelectItem>
                                            <SelectItem value="OUTRO">Outro / Não informar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Como conheceu a clínica?</Label>
                                    <Select value={formData.howKnewClinic} onValueChange={(val) => handleInputChange("howKnewClinic", val)}>
                                        <SelectTrigger className="h-10 text-sm">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INDICAO">Indicação de amigo/familiar</SelectItem>
                                            <SelectItem value="REDES_SOCIAIS">Redes Sociais (Instagram, Facebook)</SelectItem>
                                            <SelectItem value="GOOGLE">Pesquisa Google / Maps</SelectItem>
                                            <SelectItem value="OUTDOOR">Placa / Passou em frente</SelectItem>
                                            <SelectItem value="OUTRO">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {(!isMinor && formType !== "CHILD_ANAMNESIS") && (
                                <div className="flex items-center gap-2 pt-2 select-none">
                                    <input
                                        type="checkbox"
                                        id="hasRepresentativeManual"
                                        checked={hasRepresentative}
                                        onChange={(e) => setHasRepresentative(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <Label htmlFor="hasRepresentativeManual" className="text-xs font-bold text-slate-700 cursor-pointer">
                                        Paciente possui responsável legal? (Tutela, curatela ou procuração)
                                    </Label>
                                </div>
                            )}

                            {hasRepresentative && (
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-amber-800">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">
                                            Dados do Responsável Legal {(isMinor || formType === "CHILD_ANAMNESIS") && "(Obrigatório)"}
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-600">Nome do Responsável <span className="text-rose-500">*</span></Label>
                                            <Input
                                                value={formData.representativeName}
                                                onChange={(e) => handleInputChange("representativeName", e.target.value)}
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-600">CPF do Responsável <span className="text-rose-500">*</span></Label>
                                            <Input
                                                value={formData.representativeCpf}
                                                onChange={(e) => handleInputChange("representativeCpf", e.target.value)}
                                                placeholder="000.000.000-00"
                                                className="h-9 text-xs"
                                                required
                                                maxLength={14}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-600">Data de Nasc. Responsável <span className="text-rose-500">*</span></Label>
                                            <Input
                                                type="date"
                                                value={formData.representativeBirthDate}
                                                onChange={(e) => handleInputChange("representativeBirthDate", e.target.value)}
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Endereço Residencial
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">CEP <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.zipCode}
                                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                            placeholder="00000-000"
                                            className="h-9 text-xs"
                                            required
                                            maxLength={9}
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">Estado (UF) <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.state}
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">Cidade <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-3">
                                        <Label className="text-[10px] font-bold text-slate-600">Bairro <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.neighborhood}
                                            onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-3">
                                        <Label className="text-[10px] font-bold text-slate-600">Endereço / Logradouro <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.street}
                                            onChange={(e) => handleInputChange("street", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">Número <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.number}
                                            onChange={(e) => handleInputChange("number", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-4">
                                        <Label className="text-[10px] font-bold text-slate-600">Complemento</Label>
                                        <Input
                                            value={formData.complement}
                                            onChange={(e) => handleInputChange("complement", e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                    Contato de Emergência
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-600">Nome do Contato</Label>
                                        <Input
                                            value={formData.emergencyName}
                                            onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                                            placeholder="Ex: Maria (Esposa)"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-600">Telefone de Emergência</Label>
                                        <Input
                                            value={formData.emergencyPhone}
                                            onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            className="h-9 text-xs"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Observações</Label>
                                <textarea
                                    value={formData.observations}
                                    onChange={(e) => handleInputChange("observations", e.target.value)}
                                    placeholder="Ex: Algum cuidado extra, observações sobre o tratamento, etc."
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 outline-none resize-none font-medium text-slate-800 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    Histórico & Anamnese
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Preencha os dados de saúde com o máximo de informações possível.</p>
                            </div>

                            {formType === "DEFAULT_ANAMNESIS" && (
                                <StandardAnamnesis
                                    responses={responses}
                                    onChange={setResponses}
                                    queixaPrincipal={queixaPrincipal}
                                    onQueixaChange={setQueixaPrincipal}
                                />
                            )}
                            {formType === "ORTHODONTIC_ANAMNESIS" && (
                                <OrthodonticAnamnesis
                                    responses={responses}
                                    onChange={setResponses}
                                    queixaPrincipal={queixaPrincipal}
                                    onQueixaChange={setQueixaPrincipal}
                                />
                            )}
                            {formType === "CHILD_ANAMNESIS" && (
                                <ChildAnamnesis
                                    responses={responses}
                                    onChange={setResponses}
                                    queixaPrincipal={queixaPrincipal}
                                    onQueixaChange={setQueixaPrincipal}
                                />
                            )}
                            {formType === "SURGICAL_IMPLANT_ANAMNESIS" && (
                                <SurgicalAnamnesis
                                    responses={responses}
                                    onChange={setResponses}
                                    queixaPrincipal={queixaPrincipal}
                                    onQueixaChange={setQueixaPrincipal}
                                />
                            )}
                        </div>
                    )}
                </div>

                {submitError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-xl mt-4 flex items-center gap-2 animate-in fade-in duration-300">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                        <span>{submitError}</span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8 shrink-0">
                    {step > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep((s) => s - 1)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 h-10 border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" /> Voltar
                        </Button>
                    ) : (
                        <div />
                    )}

                    {(hasAnamnesis && step === 1) ? (
                        <Button
                            type="button"
                            onClick={() => {
                                if (validateStep1()) {
                                    setStep(2);
                                    setSubmitError(null);
                                } else {
                                    const form = document.querySelector("form");
                                    form?.reportValidity();
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 text-xs flex items-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            Próximo Passo <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Finalizar & Enviar</span>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
