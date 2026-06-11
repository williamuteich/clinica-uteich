"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { DeleteDialogGenericProps } from "@/src/types/dashboard/pacientes";

export function DeleteDialogGeneric({
    id,
    onDelete,
    onSuccess,
    title,
    description,
    successMessage = "Excluído com sucesso!",
    errorMessage = "Erro ao excluir.",
    triggerButton,
}: DeleteDialogGenericProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const res = await onDelete(id);
            if (res.success) {
                toast.success(successMessage);
                onSuccess();
            } else {
                toast.error(res.error || errorMessage);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {triggerButton || (
                    <Button variant="ghost" size="icon-sm" disabled={isPending} title="Excluir">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent className="border-red-100">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 font-bold flex gap-3"><AlertTriangle className="h-6 w-6 text-red-600" />{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm mt-3 text-slate-600">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="h-9 text-xs font-semibold cursor-pointer">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white h-9 text-xs font-bold cursor-pointer"
                    >
                        {isPending ? "Excluindo..." : "Sim, excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
