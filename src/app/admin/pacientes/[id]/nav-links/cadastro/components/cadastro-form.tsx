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
import { AddressFields, type AddressValues } from "@/src/app/admin/pacientes/[id]/nav-links/ficha-cadastral/address-fields";

export default function CadastroForm({ paciente }: { paciente: Paciente }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [personalFields, setPersonalFields] = useState({
        name: paciente.name || "",
        cpf: maskCPF(paciente.cpf || ""),
        birthDate: paciente.birthDate ? new Date(paciente.birthDate).toISOString().split("T")[0] : "",
        phone: maskPhone(paciente.phone || ""),
        email: paciente.email || "",
        profession: paciente.profession || "",
        gender: paciente.gender || "",
        howKnewClinic: paciente.howKnewClinic || "",
        emergencyName: paciente.emergencyName || "",
        emergencyPhone: maskPhone(paciente.emergencyPhone || ""),
        representativeName: paciente.representativeName || "",
        representativeCpf: maskCPF(paciente.representativeCpf || ""),
        representativeBirthDate: paciente.representativeBirthDate ? new Date(paciente.representativeBirthDate).toISOString().split("T")[0] : "",
        active: paciente.active ?? true,
        observations: paciente.observations || "",
    });

    const [address, setAddress] = useState<AddressValues>({
        zipCode: paciente.zipCode || "",
        state: paciente.state || "",
        city: paciente.city || "",
        neighborhood: paciente.neighborhood || "",
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
                email: personalFields.email || null,
                profession: personalFields.profession || null,
                gender: personalFields.gender || null,
                howKnewClinic: personalFields.howKnewClinic || null,
                emergencyName: personalFields.emergencyName || null,
                emergencyPhone: personalFields.emergencyPhone || null,
                representativeName: personalFields.representativeName || null,
                representativeCpf: personalFields.representativeCpf || null,
                representativeBirthDate: personalFields.representativeBirthDate || null,
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

                        <div className="grid grid-cols-2 gap-4">
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

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={personalFields.email}
                                    onChange={(e) => setPersonalFields((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="joao@exemplo.com"
                                    className="h-10 bg-white rounded-md"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-sm font-medium">Gênero</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={personalFields.gender}
                                    onChange={(e) => setPersonalFields((p) => ({ ...p, gender: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMININO">Feminino</option>
                                    <option value="OUTRO">Outro / Não informar</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="profession" className="text-sm font-medium">Profissão</Label>
                                <Input
                                    id="profession"
                                    name="profession"
                                    value={personalFields.profession}
                                    onChange={(e) => setPersonalFields((p) => ({ ...p, profession: e.target.value }))}
                                    placeholder="Ex: Engenheiro"
                                    className="h-10 bg-white rounded-md"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="howKnewClinic" className="text-sm font-medium">Como conheceu a clínica?</Label>
                            <select
                                id="howKnewClinic"
                                name="howKnewClinic"
                                value={personalFields.howKnewClinic}
                                onChange={(e) => setPersonalFields((p) => ({ ...p, howKnewClinic: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Selecione...</option>
                                <option value="INDICAO">Indicação de amigo/familiar</option>
                                <option value="REDES_SOCIAIS">Redes Sociais (Instagram, Facebook)</option>
                                <option value="GOOGLE">Pesquisa Google / Maps</option>
                                <option value="OUTDOOR">Placa / Passou em frente</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h3 className="text-sm font-bold text-slate-805 uppercase tracking-wider">
                                Contato de Emergência
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="emergencyName" className="text-sm font-medium">Nome do Contato</Label>
                                    <Input
                                        id="emergencyName"
                                        name="emergencyName"
                                        value={personalFields.emergencyName}
                                        onChange={(e) => setPersonalFields((p) => ({ ...p, emergencyName: e.target.value }))}
                                        placeholder="Ex: Maria (Esposa)"
                                        className="h-10 bg-white rounded-md"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="emergencyPhone" className="text-sm font-medium">Telefone de Emergência</Label>
                                    <Input
                                        id="emergencyPhone"
                                        name="emergencyPhone"
                                        maxLength={15}
                                        value={personalFields.emergencyPhone}
                                        onChange={(e) => setPersonalFields((p) => ({ ...p, emergencyPhone: maskPhone(e.target.value) }))}
                                        placeholder="(51) 99999-9999"
                                        className="h-10 bg-white rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h3 className="text-sm font-bold text-slate-805 uppercase tracking-wider">
                                Responsável Legal
                            </h3>
                            <div className="space-y-1.5">
                                <Label htmlFor="representativeName" className="text-sm font-medium">Nome do Responsável</Label>
                                <Input
                                    id="representativeName"
                                    name="representativeName"
                                    value={personalFields.representativeName}
                                    onChange={(e) => setPersonalFields((p) => ({ ...p, representativeName: e.target.value }))}
                                    placeholder="Ex: Carlos da Silva"
                                    className="h-10 bg-white rounded-md"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="representativeCpf" className="text-sm font-medium">CPF do Responsável</Label>
                                    <Input
                                        id="representativeCpf"
                                        name="representativeCpf"
                                        maxLength={14}
                                        value={personalFields.representativeCpf}
                                        onChange={(e) => setPersonalFields((p) => ({ ...p, representativeCpf: maskCPF(e.target.value) }))}
                                        placeholder="000.000.000-00"
                                        className="h-10 bg-white rounded-md"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="representativeBirthDate" className="text-sm font-medium">Nascimento do Responsável</Label>
                                    <Input
                                        id="representativeBirthDate"
                                        name="representativeBirthDate"
                                        type="date"
                                        value={personalFields.representativeBirthDate}
                                        onChange={(e) => setPersonalFields((p) => ({ ...p, representativeBirthDate: e.target.value }))}
                                        className="h-10 bg-white rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
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

                        <div className="space-y-1.5 pt-2">
                            <Label htmlFor="observations" className="text-sm font-medium">Observações</Label>
                            <textarea
                                id="observations"
                                name="observations"
                                value={personalFields.observations}
                                onChange={(e) => setPersonalFields((p) => ({ ...p, observations: e.target.value }))}
                                placeholder="Nenhuma observação ou observações clínicas do paciente..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-blue-500 focus:ring-blue-100 outline-none resize-none font-semibold text-slate-700 transition-all"
                            />
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