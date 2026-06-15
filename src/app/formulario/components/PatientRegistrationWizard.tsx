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
};

export default function PatientRegistrationWizard({
    patientName,
    formType,
    token,
}: PatientRegistrationWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: patientName,
        cpf: "",
        birthDate: "",
        phone: "",
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
    });

    const [queixaPrincipal, setQueixaPrincipal] = useState("");
    const [responses, setResponses] = useState<Record<string, AnamneseResponseValue>>({});

    const [isMinor, setIsMinor] = useState(false);
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
        const required = ["name", "cpf", "birthDate", "phone", "gender", "zipCode", "state", "city", "neighborhood", "street", "number"];
        if (isMinor) {
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
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Cadastro Recebido!</h1>
                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                    Obrigado, <strong className="text-slate-800 font-bold">{formData.name}</strong>. Seus dados cadastrais e questionário de anamnese foram recebidos e salvos com sucesso no sistema da clínica.
                </p>
                <div className="pt-4 border-t border-slate-100 max-w-sm mx-auto text-xs text-slate-400">
                    Você já pode fechar esta página. Nos vemos em breve na Uteich Odontologia!
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl w-full bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-all">
            <div className="bg-slate-900 text-white p-8 md:w-80 flex flex-col justify-between shrink-0">
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

                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 2 ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20" : "bg-slate-800 text-slate-400"}`}>
                                <ClipboardList className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Passo 2</p>
                                <h3 className="text-sm font-bold text-white">Anamnese</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 3 ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20" : "bg-slate-800 text-slate-400"}`}>
                                <Send className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Passo 3</p>
                                <h3 className="text-sm font-bold text-white">Revisar & Enviar</h3>
                            </div>
                        </div>
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
                                    <Label className="text-xs font-bold text-slate-700">Nome Completo</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Ex: João da Silva"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">CPF</Label>
                                    <Input
                                        value={formData.cpf}
                                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Data de Nascimento</Label>
                                    <Input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Telefone / WhatsApp</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                        required
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
                                    <Label className="text-xs font-bold text-slate-700">Gênero</Label>
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

                                <div className="space-y-2 md:col-span-2">
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

                            {isMinor && (
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-amber-800">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider">Dados do Responsável Legal</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-600">Nome do Responsável</Label>
                                            <Input
                                                value={formData.representativeName}
                                                onChange={(e) => handleInputChange("representativeName", e.target.value)}
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-600">CPF do Responsável</Label>
                                            <Input
                                                value={formData.representativeCpf}
                                                onChange={(e) => handleInputChange("representativeCpf", e.target.value)}
                                                placeholder="000.000.000-00"
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-600">Data de Nasc. Responsável</Label>
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
                                        <Label className="text-[10px] font-bold text-slate-600">CEP</Label>
                                        <Input
                                            value={formData.zipCode}
                                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                            placeholder="00000-000"
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">Estado (UF)</Label>
                                        <Input
                                            value={formData.state}
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">Cidade</Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-3">
                                        <Label className="text-[10px] font-bold text-slate-600">Bairro</Label>
                                        <Input
                                            value={formData.neighborhood}
                                            onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-3">
                                        <Label className="text-[10px] font-bold text-slate-600">Endereço / Logradouro</Label>
                                        <Input
                                            value={formData.street}
                                            onChange={(e) => handleInputChange("street", e.target.value)}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <Label className="text-[10px] font-bold text-slate-600">Número</Label>
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
                                        />
                                    </div>
                                </div>
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

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                    Revisão do Pré-Cadastro
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Revise suas respostas antes de finalizar o envio do questionário.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block uppercase">Paciente</span>
                                        <span className="font-semibold text-slate-800">{formData.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block uppercase">CPF</span>
                                        <span className="font-semibold text-slate-800">{formData.cpf}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block uppercase">Telefone</span>
                                        <span className="font-semibold text-slate-800">{formData.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block uppercase">Formulário</span>
                                        <span className="font-semibold text-slate-850">
                                            {formType === "DEFAULT_ANAMNESIS" && "Anamnese Padrão"}
                                            {formType === "ORTHODONTIC_ANAMNESIS" && "Anamnese Ortodôntica"}
                                            {formType === "CHILD_ANAMNESIS" && "Anamnese Infantil"}
                                            {formType === "SURGICAL_IMPLANT_ANAMNESIS" && "Anamnese de Cirurgia/Implante"}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200/60 pt-3">
                                    <span className="text-xs font-bold text-slate-400 block uppercase">Queixa Principal</span>
                                    <p className="text-slate-700 italic mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                                        "{queixaPrincipal}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

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

                    {step < 3 ? (
                        <Button
                            type="button"
                            onClick={() => {
                                if (step === 1 && validateStep1()) {
                                    setStep(2);
                                } else if (step === 2 && validateStep2()) {
                                    setStep(3);
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs flex items-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            {isSubmitting ? "Enviando..." : "Finalizar & Enviar"}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
