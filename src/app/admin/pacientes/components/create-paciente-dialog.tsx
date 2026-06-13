"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, User } from "lucide-react";
import { createPaciente } from "@/src/services/pacientes";
import { maskCPF, maskPhone } from "@/src/lib/masks";
import { CreatePacienteDialogProps } from "@/src/types/dashboard/pacientes";
import { toast } from "react-toastify";

export function CreatePacienteDialog({ onCreateSuccess, defaultOpen = false, defaultName = "", defaultPhone = "" }: CreatePacienteDialogProps) {
    const [open, setOpen] = useState(defaultOpen);
    const [name, setName] = useState(defaultName);
    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState(defaultPhone ? maskPhone(defaultPhone) : "");

    const [state, formAction, isPending] = useActionState(async (_prev: any, formData: FormData) => {
        const payload = {
            name,
            cpf,
            birthDate: formData.get("birthDate") as string,
            phone,
            active: true,
        };
        const result = await createPaciente(payload);
        if (result.success) {
            toast.success("Paciente cadastrado com sucesso!");
            setOpen(false);
            setName("");
            setCpf("");
            setPhone("");
            onCreateSuccess();
        }
        return result;
    }, null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>

                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-10 font-semibold text-xs rounded-md"
                >
                    <Plus className="mr-2 h-4 w-4" /> Novo Paciente
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                        <User className="h-5 w-5 text-blue-600" />
                        Cadastrar Novo Paciente
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                        Preencha todas as informações cadastrais obrigatórias.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-5 py-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</Label>
                            <Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="João da Silva" required className="h-10" />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">CPF</Label>
                            <Input
                                value={cpf}
                                onChange={(e) => setCpf(maskCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                required
                                className="h-10"
                                maxLength={14}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Nascimento</Label>
                            <Input name="birthDate" type="date" required className="h-10" />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Telefone / WhatsApp</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(maskPhone(e.target.value))}
                                placeholder="(51) 99999-9999"
                                required
                                className="h-10"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{state.error}</p>
                    )}

                    <DialogFooter className="bg-slate-50/55 -mx-6 -mb-6 p-5 border-t rounded-b-lg">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 min-w-[150px]"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cadastrando...
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