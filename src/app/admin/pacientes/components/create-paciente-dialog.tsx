"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, User, Phone, CalendarDays } from "lucide-react";
import { createPaciente } from "@/src/services/pacientes";
import { toast } from "react-toastify";
import { CreatePacienteDialogProps } from "@/src/types/dashboard/pacientes";
import { maskCPF, maskPhone } from "@/src/lib/masks";

export function CreatePacienteDialog({ onCreateSuccess }: CreatePacienteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState("");

    const resetForm = () => {
        setCpf("");
        setPhone("");
    };

    const handleAction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const payload = {
                name: formData.get("name") as string,
                cpf,
                birthDate: formData.get("birthDate") as string,
                phone,
                active: true,
            };

            const res = await createPaciente(payload);

            if (res.success) {
                toast.success("Paciente cadastrado com sucesso!");
                setOpen(false);
                resetForm();
                onCreateSuccess();
            } else {
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
                                value={cpf}
                                onChange={(e) => setCpf(maskCPF(e.target.value))}
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
                                value={phone}
                                onChange={(e) => setPhone(maskPhone(e.target.value))}
                                placeholder="(51) 99999-9999"
                                required
                                className="h-10 bg-white"
                                maxLength={15}
                            />
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
