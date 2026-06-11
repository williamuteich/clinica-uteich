"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, ShieldAlert, Key, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Role, PermissionToRole } from "@/src/types/dashboard/admins";
import { ALL_RESOURCES, ALL_ACTIONS } from "@/src/lib/navigation";
import { ViewPermissions } from "./view-permissions";
import { createRole, updateRole, deleteRole, getRoles } from "@/src/services/roles";
import { DeleteDialogGeneric } from "@/src/app/components/delete-dialog-generic";
import { toast, ToastContainer } from "react-toastify";

export function RoleManagement({ initialRoles }: { initialRoles: Role[] }) {
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [isPending, startTransition] = useTransition();

    const fetchRolesLocally = async () => {
        const newRoles = await getRoles();
        if (newRoles) setRoles(newRoles);
    };

    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<{ resource: string, action: string }[]>([]);

    useEffect(() => {
        setRoles(initialRoles);
    }, [initialRoles]);

    const togglePermission = (resource: string, action: string) => {
        setSelectedPermissions(prev => {
            const exists = prev.find(p => p.resource === resource && p.action === action);
            if (exists) return prev.filter(p => !(p.resource === resource && p.action === action));
            return [...prev, { resource, action }];
        });
    };

    const handleAction = (formData: FormData) => {
        if (selectedPermissions.length === 0) {
            setError("Selecione permissões");
            return;
        }

        startTransition(async () => {
            const name = formData.get("name") as string;
            const description = formData.get("description") as string;
            const data = { name, description, permissions: selectedPermissions };

            const res = editingRole ? await updateRole(editingRole.id, data) : await createRole(data);
            if (res.success) {
                setOpen(false);
                toast.success(editingRole ? "Cargo atualizado com sucesso!" : "Cargo criado com sucesso!");
                fetchRolesLocally();
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao salvar cargo");
                setError(res.error || "Erro ao salvar");
            }
        });
    };

    return (
        <div className="space-y-4">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Key className="h-5 w-5 text-indigo-500" /> Gestão de Cargos</h2>
                    <p className="text-sm text-muted-foreground">Defina os níveis de acesso e permissões do sistema.</p>
                </div>

                <Dialog open={open} onOpenChange={(val) => { if (!val) { setEditingRole(null); setSelectedPermissions([]); setError(""); } setOpen(val); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-10 cursor-pointer font-semibold text-xs rounded-md">
                            <Plus className="mr-2 h-4 w-4" /> Novo Cargo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-y-auto max-h-[90vh]">
                        <form key={editingRole?.id || "new-role"} action={handleAction} className="space-y-6 py-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> {editingRole ? "Editar Cargo" : "Criar Novo Cargo"}</DialogTitle>
                                <DialogDescription>Nomeie o cargo e selecione as permissões granulares.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome do Cargo</Label>
                                    <Input name="name" defaultValue={editingRole?.name} placeholder="Ex: Gerente" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Input name="description" defaultValue={editingRole?.description || ""} placeholder="Opcional" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Permissões</Label>
                                <div className="grid gap-4">
                                    {ALL_RESOURCES.map(resource => (
                                        <div key={resource} className="space-y-2 border rounded-lg p-3 bg-muted/30">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{resource}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ALL_ACTIONS.map(action => {
                                                    const isSelected = selectedPermissions.some(p => p.resource === resource && p.action === action);
                                                    return (
                                                        <button key={action} type="button" onClick={() => togglePermission(resource, action)}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-white border text-zinc-600 hover:border-indigo-300"}`}>
                                                            {isSelected && <CheckCircle2 className="h-3 w-3" />}
                                                            {action.charAt(0).toUpperCase() + action.slice(1)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isPending} className="w-full bg-indigo-600">
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Cargo"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Permissões</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id} className={`hover:bg-muted/30 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                                <TableCell className="font-bold text-slate-800">{role.name}</TableCell>
                                <TableCell className="text-sm text-slate-500">{role.description || "-"}</TableCell>
                                <TableCell><ViewPermissions permissions={role.permissions} roleName={role.name} /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {role.name !== "Admin" ? (
                                            <>
                                                <Button variant="ghost" size="icon-sm" onClick={() => { setEditingRole(role); setSelectedPermissions(role.permissions.map((p: PermissionToRole) => ({ resource: p.permission.resource, action: p.permission.action }))); setOpen(true); }} disabled={isPending}><Pencil className="h-4 w-4 text-slate-500" /></Button>
                                                <DeleteDialogGeneric
                                                    id={String(role.id)}
                                                    onDelete={async (idStr) => deleteRole(idStr)}
                                                    onSuccess={() => {
                                                        fetchRolesLocally();
                                                        router.refresh();
                                                    }}
                                                    title="Remover Cargo"
                                                    description={`Remover ${role.name}?`}
                                                    successMessage="Cargo removido com sucesso!"
                                                    errorMessage="Erro ao excluir cargo."
                                                />
                                            </>
                                        ) : <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 rounded bg-slate-50">Sistema</div>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
