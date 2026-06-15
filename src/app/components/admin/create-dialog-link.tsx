import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";

export function CreatePatientLinkDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Gerar Link de Cadastro
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gerar Link de Cadastro</DialogTitle>

                    <DialogDescription>
                        Envie este link para que o paciente preencha seus dados
                        cadastrais antes da consulta.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-5">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="patient-name">
                                Nome do paciente
                            </Label>

                            <Input
                                id="patient-name"
                                placeholder="Ex: João da Silva"
                            />
                        </Field>
                    </FieldGroup>

                    <div className="flex items-start gap-3 rounded-lg border p-4">
                        <Checkbox id="anamnesis" />

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

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>

                        <Button type="submit">
                            Gerar Link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}