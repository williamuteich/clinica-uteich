"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Circle,
    ClipboardList,
    Pencil,
    Plus,
    Trash2,
    Calendar,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PatientTask, TasksModalProps, UpdateTaskInput } from "@/src/types/dashboard/tarefa";
import { createTarefa, updateTarefa, deleteTarefa } from "@/src/services/tarefas";

function formatDueDate(dueDate: string | null | undefined): { label: string; isOverdue: boolean; isToday: boolean } {
    if (!dueDate) return { label: "", isOverdue: false, isToday: false };
    const due = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 86400000);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDay.getTime() === today.getTime()) return { label: "Hoje", isOverdue: false, isToday: true };
    if (dueDay.getTime() === tomorrow.getTime()) return { label: "Amanhã", isOverdue: false, isToday: false };
    if (dueDay < today) return {
        label: due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        isOverdue: true,
        isToday: false,
    };
    return {
        label: due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        isOverdue: false,
        isToday: false,
    };
}

interface TaskFormData {
    title: string;
    description: string;
    dueDate: string;
}

function TaskForm({
    patientId,
    initialTask,
    onSuccess,
    onCancel,
}: {
    patientId: string;
    initialTask?: PatientTask | null;
    onSuccess: (task: PatientTask) => void;
    onCancel: () => void;
}) {
    const [isPending, setIsPending] = useState(false);
    const [form, setForm] = useState<TaskFormData>({
        title: initialTask?.title ?? "",
        description: initialTask?.description ?? "",
        dueDate: initialTask?.dueDate
            ? new Date(initialTask.dueDate).toISOString().slice(0, 10)
            : "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.warning("O título da tarefa é obrigatório.");
            return;
        }

        setIsPending(true);
        try {
            let res;
            if (initialTask) {
                res = await updateTarefa(patientId, initialTask.id, {
                    title: form.title,
                    description: form.description || null,
                    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
                });
            } else {
                res = await createTarefa({
                    patientId,
                    title: form.title,
                    description: form.description || undefined,
                    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
                });
            }

            if (res.success && res.data) {
                toast.success(initialTask ? "Tarefa atualizada!" : "Tarefa criada com sucesso!");
                onSuccess(res.data);
            } else {
                toast.error(res.error || "Erro ao salvar tarefa.");
            }
        } catch {
            toast.error("Erro interno. Tente novamente.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label htmlFor="task-title" className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Título / Ação <span className="text-rose-500">*</span>
                </label>
                <p className="text-[10px] text-slate-400 font-medium leading-normal -mt-0.5">
                    Defina o objetivo principal. Exemplos: <span className="italic font-semibold text-slate-600">"Solicitar guia de convênio"</span>, <span className="italic font-semibold text-slate-600">"Ligar pós-operatório"</span> ou <span className="italic font-semibold text-slate-600">"Cobrar prótese do laboratório"</span>.
                </p>
                <input
                    id="task-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Ligar pós-operatório de implante"
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    autoFocus
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="task-desc" className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Detalhes / Observações
                </label>
                <p className="text-[10px] text-slate-400 font-medium leading-normal -mt-0.5">
                    Adicione observações importantes para quem for executar. Exemplo: <span className="italic font-semibold text-slate-600">"Confirmar se o paciente está tomando o antibiótico e se há dor residual."</span>
                </p>
                <textarea
                    id="task-desc"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Ligar após as 14h. Número secundário: (51) 99999-9999."
                    className="w-full h-24 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="task-date" className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Prazo
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        id="task-date"
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                    {isPending ? "Salvando..." : initialTask ? "Salvar alterações" : "Criar tarefa"}
                </button>
            </div>
        </form>
    );
}

function TaskItem({
    task,
    patientId,
    onUpdate,
    onDelete,
}: {
    task: PatientTask;
    patientId: string;
    onUpdate: (id: string, data: UpdateTaskInput) => void;
    onDelete: (id: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const due = formatDueDate(task.dueDate);

    const handleToggle = async () => {
        setIsToggling(true);
        const res = await updateTarefa(patientId, task.id, { completed: !task.completed });
        if (res.success && res.data) {
            onUpdate(task.id, { completed: !task.completed });
        } else {
            toast.error("Erro ao atualizar tarefa.");
        }
        setIsToggling(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const res = await deleteTarefa(patientId, task.id);
        if (res.success) {
            onDelete(task.id);
            toast.success("Tarefa removida.");
        } else {
            toast.error(res.error || "Erro ao remover tarefa.");
        }
        setIsDeleting(false);
    };

    if (editing) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in duration-200">
                <TaskForm
                    patientId={patientId}
                    initialTask={task}
                    onSuccess={(updated) => {
                        onUpdate(task.id, updated);
                        setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className={cn(
            "group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200",
            task.completed
                ? "bg-slate-50/50 border-slate-100"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
        )}>
            <button
                onClick={handleToggle}
                disabled={isToggling}
                className="mt-0.5 shrink-0 transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                title={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
            >
                {task.completed
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                }
            </button>

            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-bold text-slate-800 leading-tight",
                    task.completed && "line-through text-slate-400"
                )}>
                    {task.title}
                </p>
                {task.description && (
                    <p className={cn(
                        "text-xs text-slate-500 font-medium mt-0.5 leading-relaxed",
                        task.completed && "text-slate-300"
                    )}>
                        {task.description}
                    </p>
                )}
                {due.label && (
                    <div className={cn(
                        "flex items-center gap-1 mt-1.5 text-[10px] font-black uppercase tracking-wider",
                        due.isOverdue && !task.completed ? "text-rose-500" : due.isToday ? "text-amber-500" : "text-slate-400"
                    )}>
                        {due.isOverdue && !task.completed && <AlertCircle className="h-3 w-3" />}
                        <Calendar className="h-3 w-3" />
                        <span>{due.label}</span>
                    </div>
                )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Editar tarefa"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Excluir tarefa"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

export function TasksModal({ patientId, patientName }: TasksModalProps) {
    const [tasks, setTasks] = useState<PatientTask[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [open, setOpen] = useState(false);

    const loadTasks = async () => {
        if (loaded) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/pacientes/${patientId}/tarefas`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks ?? []);
                setLoaded(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) loadTasks();
        else { setShowForm(false); }
    };

    const handleTaskCreated = (task: PatientTask) => {
        setTasks(prev => [task, ...prev]);
        setShowForm(false);
    };

    const handleTaskUpdated = (id: string, data: UpdateTaskInput) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    };

    const handleTaskDeleted = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const pending = tasks.filter(t => !t.completed);
    const done = tasks.filter(t => t.completed);

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-colors">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-black text-slate-800">Tarefas</h4>
                                    {pending.length > 0 && (
                                        <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                            {pending.length}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {tasks.length === 0
                                        ? "Nenhuma tarefa cadastrada"
                                        : `${pending.length} pendente${pending.length !== 1 ? "s" : ""}`}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl p-0 gap-0 rounded-2xl border-none shadow-2xl overflow-hidden">
                    <ToastContainer position="top-right" autoClose={3000} theme="colored" />

                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-base font-black text-slate-900">
                                    Tarefas
                                </DialogTitle>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                    Tarefas de <span className="text-slate-600 font-black">{patientName}</span>
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-9 px-4 gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-4 w-4" /> Nova tarefa
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
                        {showForm && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Nova tarefa</p>
                                <TaskForm
                                    patientId={patientId}
                                    onSuccess={handleTaskCreated}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        )}

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : tasks.length === 0 && !showForm ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                                        <ClipboardList className="h-10 w-10 text-blue-300" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-700">Nenhuma tarefa pendente</p>
                                    <p className="text-xs text-slate-400 font-semibold max-w-xs">
                                        Clique em <span className="font-black text-blue-600">Nova tarefa</span> para adicionar uma tarefa para este paciente.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {pending.length > 0 && (
                                    <div className="space-y-2">
                                        {pending.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                patientId={patientId}
                                                onUpdate={handleTaskUpdated}
                                                onDelete={handleTaskDeleted}
                                            />
                                        ))}
                                    </div>
                                )}

                                {done.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                                            Concluídas ({done.length})
                                        </p>
                                        {done.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                patientId={patientId}
                                                onUpdate={handleTaskUpdated}
                                                onDelete={handleTaskDeleted}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
