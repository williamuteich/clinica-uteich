"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus, Loader2, User, Phone, MapPin, CalendarDays
} from "lucide-react";
import { createPaciente } from "@/src/services/pacientes";
import { toast } from "react-toastify";
import { CreatePacienteDialogProps } from "@/src/types/dashboard/pacientes";

async function fetchCep(cep: string) {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return null;
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    return data.erro ? null : data;
}

const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
};

const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
};

const maskCEP = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{3})\d+?$/, "$1");
};

export function CreatePacienteDialog({ onCreateSuccess }: CreatePacienteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [cepLoading, setCepLoading] = useState(false);
    const [error, setError] = useState("");

    const [addressFields, setAddressFields] = useState({
        state: "",
        city: "",
        street: "",
    });
    
    const [masks, setMasks] = useState({
        cpf: "",
        phone: "",
        zipCode: "",
    });

    const resetForm = () => {
        setAddressFields({ state: "", city: "", street: "" });
        setMasks({ cpf: "", phone: "", zipCode: "" });
        setError("");
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) return;
        setCepLoading(true);
        const data = await fetchCep(val);
        if (data) {
            setAddressFields({ state: data.uf || "", city: data.localidade || "", street: data.logradouro || "" });
            setMasks(prev => ({ ...prev, zipCode: maskCEP(val) }));
        }
        setCepLoading(false);
    };

    const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>, maskFn: (val: string) => string, field: string) => {
        setMasks(prev => ({ ...prev, [field]: maskFn(e.target.value) }));
    };

    const handleAction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const payload = {
                name: formData.get("name") as string,
                cpf: formData.get("cpf") as string,
                birthDate: formData.get("birthDate") as string,
                phone: formData.get("phone") as string,
                zipCode: formData.get("zipCode") as string,
                state: formData.get("state") as string,
                city: formData.get("city") as string,
                street: formData.get("street") as string,
                number: formData.get("number") as string,
                complement: (formData.get("complement") as string) || undefined,
                active: true,
            };

            const res = await createPaciente(payload);

            if (res.success) {
                toast.success("Paciente cadastrado com sucesso!");
                setOpen(false);
                resetForm();
                onCreateSuccess();
            } else {
                setError(res.error || "Erro ao cadastrar paciente.");
                toast.error(res.error || "Erro ao cadastrar paciente.");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); setOpen(val); }}>
            <DialogTrigger render={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-10 cursor-pointer font-semibold text-xs rounded-md">
                    <Plus className="mr-2 h-4 w-4" /> Novo Paciente
                </Button>
            } />
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                        <User className="h-5 w-5 text-blue-600" />
                        Cadastrar Novo Paciente
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                        Preencha todas as informações cadastrais obrigatórias para abrir a ficha clínica do paciente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAction} className="space-y-5 py-3">
                    {error && (
                        <div className="p-3 text-xs font-semibold text-red-650 bg-red-50 border border-red-100 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <User className="h-3 w-3 text-blue-600" /> Nome Completo
                            </Label>
                            <Input name="name" placeholder="João da Silva" required className="h-10 bg-white" />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CPF</Label>
                            <Input 
                                name="cpf" 
                                value={masks.cpf} 
                                onChange={e => handleMaskChange(e, maskCPF, 'cpf')} 
                                placeholder="000.000.000-00" 
                                required 
                                className="h-10 bg-white"
                                maxLength={14}
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Nascimento
                            </Label>
                            <Input name="birthDate" type="date" required className="h-10 bg-white" />
                        </div>
                        
                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Phone className="h-3 w-3 text-blue-600" /> Telefone / WhatsApp
                            </Label>
                            <Input 
                                name="phone" 
                                value={masks.phone} 
                                onChange={e => handleMaskChange(e, maskPhone, 'phone')} 
                                placeholder="(51) 99999-9999" 
                                required 
                                className="h-10 bg-white"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-4">
                            <MapPin className="h-3.5 w-3.5 text-blue-600" /> Endereço Residencial
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CEP</Label>
                                <div className="relative">
                                    <Input 
                                        name="zipCode" 
                                        value={masks.zipCode} 
                                        onChange={e => handleMaskChange(e, maskCEP, 'zipCode')} 
                                        placeholder="00000-000" 
                                        onBlur={handleCepBlur} 
                                        required 
                                        className="h-10 bg-white pr-9"
                                    />
                                    {cepLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />}
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado (UF)</Label>
                                <Input 
                                    name="state" 
                                    value={addressFields.state} 
                                    onChange={e => setAddressFields(p => ({ ...p, state: e.target.value }))} 
                                    placeholder="RS" 
                                    required 
                                    className="h-10 bg-white"
                                />
                            </div>
                            
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cidade</Label>
                                <Input 
                                    name="city" 
                                    value={addressFields.city} 
                                    onChange={e => setAddressFields(p => ({ ...p, city: e.target.value }))} 
                                    placeholder="Porto Alegre" 
                                    required 
                                    className="h-10 bg-white"
                                />
                            </div>
                            
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rua / Logradouro</Label>
                                <Input 
                                    name="street" 
                                    value={addressFields.street} 
                                    onChange={e => setAddressFields(p => ({ ...p, street: e.target.value }))} 
                                    placeholder="Rua das Flores" 
                                    required 
                                    className="h-10 bg-white"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número</Label>
                                <Input name="number" placeholder="123" required className="h-10 bg-white" />
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complemento</Label>
                                <Input name="complement" placeholder="Apto 2B" className="h-10 bg-white" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50/55 -mx-6 -mb-6 p-5 border-t flex justify-end gap-3 rounded-b-lg">
                        <Button 
                            type="submit" 
                            disabled={isPending} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 min-w-[150px] cursor-pointer"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Cadastrando...</span>
                                </span>
                            ) : (
                                "Cadastrar Paciente"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
