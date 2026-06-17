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
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Loader2,
    Mail,
    ShieldCheck,
    Pencil,
    Clock,
    User
} from "lucide-react";
import { Admin, Role, AdminsResponse, AdminFilters } from "@/src/types/dashboard/admins";
import { createAdmin, updateAdmin, deleteAdmin, getAdmins } from "@/src/services/administrator";
import { DeleteDialogGeneric } from "@/src/app/components/admin/delete-dialog-generic";
import { toast, ToastContainer } from "react-toastify";
import { useDebounce } from "@/src/hook/use-debounce";
import { SearchInput } from "@/src/app/components/admin/search-input";
import { Pagination } from "@/src/app/components/admin/pagination";


export function AdminManagement({
    initialData,
    initialRoles
}: {
    initialData: AdminsResponse,
    initialRoles: Role[]
}) {
    const router = useRouter();
    const [data, setData] = useState<AdminsResponse>(initialData);
    const [filters, setFilters] = useState<AdminFilters>({
        page: 1,
        limit: 20
    });
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 700);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (debouncedSearchTerm !== (filters.name || "")) {
            fetchAdmins({ ...filters, name: debouncedSearchTerm || undefined, page: 1 });
        }
    }, [debouncedSearchTerm]);

    const fetchAdmins = (newFilters: AdminFilters) => {
        startTransition(async () => {
            const result = await getAdmins(newFilters);
            if (result) {
                setData(result);
                setFilters(newFilters);
            }
        });
    };

    const handlePageChange = (newPage: number) => {
        fetchAdmins({ ...filters, page: newPage });
    };

    const handleAction = (formData: FormData) => {
        startTransition(async () => {
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const roleId = formData.get("roleId") as string;
            const active = formData.get("active") === "on";

            const adminData = { name, email, roleId, active };
            const res = editingAdmin ? await updateAdmin(editingAdmin.id, adminData) : await createAdmin(adminData);

            if (res.success) {
                setOpen(false);
                toast.success(editingAdmin ? "Administrador atualizado com sucesso!" : "Administrador criado com sucesso!");
                fetchAdmins(filters);
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao salvar administrador");
                setError(res.error || "Erro ao salvar");
            }
        });
    };

    return (
        <div className="space-y-4">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar administrador..."
                        className="w-[260px]"
                    />
                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}

                </div>

                <Dialog open={open} onOpenChange={(val) => { if (!val) { setEditingAdmin(null); setError(""); } setOpen(val); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-10">
                            <Plus className="mr-2 h-4 w-4" /> Novo Administrador
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form key={editingAdmin?.id || "new-admin"} action={handleAction}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /> {editingAdmin ? "Editar Administrador" : "Novo Administrador"}</DialogTitle>
                                <DialogDescription>Configure o acesso do administrador.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input name="name" defaultValue={editingAdmin?.name || ""} placeholder="Ex: William Uteich" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>E-mail Profissional</Label>
                                    <Input name="email" type="email" defaultValue={editingAdmin?.email || ""} placeholder="exemplo@empresa.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cargo / Nível de Acesso</Label>
                                    <select name="roleId" className="w-full h-10 px-3 py-2 border rounded-md bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" defaultValue={editingAdmin?.role?.id ? String(editingAdmin.role.id) : ""} required>
                                        <option value="">Selecione um cargo</option>
                                        {initialRoles.filter(role => role.name !== "Admin").map((role) => (
                                            <option key={role.id} value={String(role.id)}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {editingAdmin && (
                                    <div className="flex items-center gap-2 py-2">
                                        <input name="active" type="checkbox" id="active" defaultChecked={editingAdmin.active} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                        <Label htmlFor="active" className="cursor-pointer">Acesso Ativo</Label>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isPending} className="w-full bg-blue-600">
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-900 border-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-bold text-slate-100 py-3.5 rounded-tl-xl pl-4">Nome</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">E-mail</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Cargo</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5">Status</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5 flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-200" /> Último Login</TableHead>
                            <TableHead className="font-bold text-slate-100 py-3.5 text-right pr-4 rounded-tr-xl">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.admins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Nenhum administrador encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.admins.map((admin) => (
                                <TableRow key={admin.id} className={`hover:bg-muted/30 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                                    <TableCell className="font-semibold text-slate-800 py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            {admin.image ? (
                                                <img
                                                    src={admin.image}
                                                    alt={admin.name || ""}
                                                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200/80 shadow-2xs"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                                                    <User className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span className="font-bold text-slate-700">{admin.name || "Sem nome"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4"><div className="flex items-center gap-2 text-slate-600 italic"><Mail className="h-3.5 w-3.5" /> {admin.email}</div></TableCell>
                                    <TableCell className="py-4">
                                        {admin.role ? (
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[11px] font-bold tracking-tight shadow-sm ${admin.role.name === "Admin" ? "text-amber-700 bg-amber-50 border border-amber-200" : "text-blue-700 bg-blue-50 border border-blue-100"}`}>
                                                <ShieldCheck className="h-3 w-3" /> {admin.role.name}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[11px] font-bold tracking-tight shadow-sm text-purple-700 bg-purple-50 border border-purple-200">
                                                <ShieldCheck className="h-3 w-3 text-purple-500" /> Master
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4"><Badge variant={admin.active ? "default" : "secondary"} className={admin.active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50" : ""}>{admin.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                                    <TableCell className="text-xs text-slate-500 py-4 font-medium">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Nunca logou"}</TableCell>
                                    <TableCell className="text-right py-4 pr-4">
                                        <div className="flex justify-end gap-2">
                                            {admin.email !== "williamuteich14@gmail.com" ? (
                                                <>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditingAdmin(admin); setOpen(true); }} disabled={isPending}><Pencil className="h-4 w-4 text-slate-500" /></Button>
                                                    <DeleteDialogGeneric
                                                        id={String(admin.id)}
                                                        onDelete={async (idStr) => deleteAdmin(idStr)}
                                                        onSuccess={() => {
                                                            fetchAdmins(filters);
                                                            router.refresh();
                                                        }}
                                                        title="Remover Administrador"
                                                        description={`Remover ${admin.name || admin.email}?`}
                                                        successMessage="Administrador removido com sucesso!"
                                                        errorMessage="Erro ao excluir administrador."
                                                    />
                                                </>
                                            ) : <div className="px-2 py-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest border border-amber-200 rounded bg-amber-50">Sistema</div>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={data.limit}
                    itemName="administradores"
                    onPageChange={handlePageChange}
                    disabled={isPending}
                />
            </div>
        </div>
    );
}

