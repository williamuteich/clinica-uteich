"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, User, Phone, MapPin, CalendarDays, Save } from "lucide-react";
import { Paciente } from "@/src/types/dashboard/pacientes";
import { updatePaciente } from "@/src/services/pacientes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast, ToastContainer } from "react-toastify";
import { maskCPF, maskPhone } from "@/src/lib/masks";
import { AddressFields, type AddressValues } from "@/src/components/shared/address-fields";

export default function CadastroForm({ paciente }: { paciente: Paciente }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [personalFields, setPersonalFields] = useState({
        name: paciente.name || "",
        cpf: paciente.cpf || "",
        birthDate: paciente.birthDate ? new Date(paciente.birthDate).toISOString().split("T")[0] : "",
        phone: paciente.phone || "",
        active: paciente.active ?? true,
    });

    const [address, setAddress] = useState<AddressValues>({
        zipCode: paciente.zipCode || "",
        state: paciente.state || "",
        city: paciente.city || "",
        street: paciente.street || "",
        number: paciente.number || "",
        complement: paciente.complement || "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTransition(async () => {
            const payload: Partial<Paciente> = {
                ...personalFields,
                ...address,
                complement: address.complement || undefined,
            };

            const res = await updatePaciente(paciente.id, payload);
            if (res.success) {
                toast.success("Alterações salvas com sucesso!");
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao salvar alterações");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 w-full animate-in fade-in duration-500">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <div className="space-y-6 w-full">
                    <div className="border-b pb-2">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Dados Pessoais
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Identificação e contatos principais do paciente.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                value={personalFields.name}
                                onChange={(e) => setPersonalFields((p) => ({ ...p, name: e.target.value }))}
                                placeholder="João da Silva"
                                required
                                className="h-10 bg-white rounded-md"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                                <Input
                                    id="cpf"
                                    name="cpf"
                                    value={personalFields.cpf}
                                    onChange={(e) => setPersonalFields((p) => ({ ...p, cpf: maskCPF(e.target.value) }))}
                                    placeholder="000.000.000-00"
                                    required
                                    maxLength={14}
                                    className="h-10 bg-white rounded-md"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4 text-slate-500" /> Nascimento
                                </Label>
                                <Input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    value={personalFields.birthDate}
                                    onChange={(e) => setPersonalFields((p) => ({ ...p, birthDate: e.target.value }))}
                                    required
                                    className="h-10 bg-white rounded-md"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                                <Phone className="h-4 w-4 text-slate-500" /> Telefone / WhatsApp
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                maxLength={15}
                                value={personalFields.phone}
                                onChange={(e) => setPersonalFields((p) => ({ ...p, phone: maskPhone(e.target.value) }))}
                                placeholder="(51) 99999-9999"
                                required
                                className="h-10 bg-white rounded-md"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <input
                                type="checkbox"
                                name="active"
                                id="active"
                                checked={personalFields.active}
                                onChange={(e) => setPersonalFields((p) => ({ ...p, active: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <Label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                Paciente com cadastro ativo
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 w-full">
                    <div className="border-b pb-2">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Endereço Residencial
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Localização atualizada para correspondências ou contatos.
                        </p>
                    </div>

                    <AddressFields
                        values={address}
                        onChange={(updated) => setAddress((prev) => ({ ...prev, ...updated }))}
                    />
                </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-end gap-3">
                <Link
                    href="/admin/pacientes"
                    className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6 rounded-md flex items-center justify-center")}
                >
                    Cancelar
                </Link>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 h-11 px-6 rounded-md min-w-[160px] flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /><span>Salvando...</span></>
                    ) : (
                        <><Save className="h-4 w-4" /><span>Salvar Alterações</span></>
                    )}
                </Button>
            </div>
        </form>
    );
}