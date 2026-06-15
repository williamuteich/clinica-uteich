"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Send } from "lucide-react";
import { toast } from "react-toastify";
import { createGeneratedLink } from "@/src/services/pacientes";
import { GeneratedLinkInput } from "@/src/schemas/paciente";
import { phoneToWhatsapp } from "@/src/lib/masks";

export function CreatePatientLinkDialog({
    asLink = false,
    defaultPatientName = "",
    defaultPatientPhone = "",
}: {
    asLink?: boolean;
    defaultPatientName?: string;
    defaultPatientPhone?: string;
}) {
    const [name, setName] = useState(defaultPatientName);
    const [hasAnamnesis, setHasAnamnesis] = useState(false);
    const [anamnesisType, setAnamnesisType] = useState<GeneratedLinkInput["formType"]>("DEFAULT_ANAMNESIS");
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setName(defaultPatientName);
        setGeneratedLink("");
        setHasAnamnesis(false);
        setAnamnesisType("DEFAULT_ANAMNESIS");
        setCopied(false);
    }, [defaultPatientName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createGeneratedLink({
                patientName: name.trim(),
                hasAnamnesis,
                formType: hasAnamnesis ? anamnesisType : "DEFAULT_ANAMNESIS",
            });
            if (res.success && res.data) {
                setGeneratedLink(res.data.link);
                toast.success("Link gerado com sucesso!");
            } else {
                toast.error(res.error || "Erro ao gerar link");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedLink) return;
        try {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            toast.success("Link copiado para a área de transferência!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Erro ao copiar the link.");
        }
    };

    const handleShareWhatsApp = () => {
        if (!generatedLink) return;
        const msg = `Olá! Clique no link a seguir para realizar o seu pré-cadastro na Uteich Odontologia: ${generatedLink}`;
        let whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        
        if (defaultPatientPhone) {
            const cleanPhone = phoneToWhatsapp(defaultPatientPhone);
            if (cleanPhone) {
                whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
            }
        }
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {asLink ? (
                    <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
                    >
                        Gerar Link de Cadastro
                    </button>
                ) : (
                    <Button variant="outline">
                        Gerar Link de Cadastro
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gerar Link de Cadastro</DialogTitle>

                    <DialogDescription>
                        Envie este link para que o paciente preencha seus dados
                        cadastrais antes da consulta.
                    </DialogDescription>
                </DialogHeader>

                {generatedLink ? (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="generated-url" className="text-xs font-bold text-slate-500 uppercase">
                                Link de cadastro gerado
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="generated-url"
                                    readOnly
                                    value={generatedLink}
                                    className="flex-1 bg-slate-50 font-mono text-xs text-slate-600"
                                />
                                <Button
                                    type="button"
                                    onClick={handleCopy}
                                    variant="outline"
                                    className="px-3"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-slate-500" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleShareWhatsApp}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                        >
                            <Send className="h-4 w-4" />
                            Enviar pelo WhatsApp
                        </Button>

                        <DialogFooter className="pt-2 border-t border-slate-100 flex gap-2">
                            <Button
                                type="button"
                                onClick={() => setGeneratedLink("")}
                                variant="outline"
                                className="flex-1"
                            >
                                Gerar outro
                            </Button>
                            <DialogClose asChild>
                                <Button type="button" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                    Fechar
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="patient-name">
                                    Nome do paciente
                                </Label>

                                <Input
                                    id="patient-name"
                                    placeholder="Ex: João da Silva"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Field>
                        </FieldGroup>

                        <div className="flex items-start gap-3 rounded-lg border p-4">
                            <Checkbox
                                id="anamnesis"
                                checked={hasAnamnesis}
                                onCheckedChange={(checked) =>
                                    setHasAnamnesis(checked === true)
                                }
                            />

                            <div className="space-y-1">
                                <Label
                                    htmlFor="anamnesis"
                                    className="cursor-pointer"
                                >
                                    Solicitar preenchimento da anamnese em seguida
                                </Label>

                                <p className="text-xs text-muted-foreground">
                                    Após concluir o cadastro, o paciente será
                                    direcionado automaticamente para a anamnese.
                                </p>
                            </div>
                        </div>

                        {hasAnamnesis && (
                            <Field>
                                <Label htmlFor="anamnesis-type">
                                    Tipo de anamnese
                                </Label>

                                <Select
                                    value={anamnesisType}
                                    onValueChange={(val) => setAnamnesisType(val as GeneratedLinkInput["formType"])}
                                >
                                    <SelectTrigger id="anamnesis-type">
                                        <SelectValue placeholder="Selecione o tipo de anamnese" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="DEFAULT_ANAMNESIS">
                                            Anamnese Padrão
                                        </SelectItem>

                                        <SelectItem value="ORTHODONTIC_ANAMNESIS">
                                            Anamnese Ortodôntica
                                        </SelectItem>

                                        <SelectItem value="CHILD_ANAMNESIS">
                                            Anamnese Infantil
                                        </SelectItem>

                                        <SelectItem value="SURGICAL_IMPLANT_ANAMNESIS">
                                            Anamnese Cirúrgica / Implante
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={loading}>
                                    Cancelar
                                </Button>
                            </DialogClose>

                            <Button type="submit" disabled={loading}>
                                {loading ? "Gerando..." : "Gerar Link"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}