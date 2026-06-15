import Link from "next/link";
import {
    FlaskConical,
    Clock,
    CheckCircle2,
    CalendarRange,
    Pickaxe,
    GitBranch,
} from "lucide-react";
import { ProtheticWork } from "@/src/types/dashboard/trabalho";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PatientProtheticWorksSectionProps {
    patientId: string;
    patientName: string;
    protheticWorks: ProtheticWork[];
}

const workTypeIcon: Record<string, React.ElementType> = {
    crown: GitBranch,
    bridge: GitBranch,
    denture: Pickaxe,
    inlay: FlaskConical,
    default: FlaskConical,
};

const getWorkTypeIcon = (workName: string) => {
    const lower = workName.toLowerCase();
    if (lower.includes("coroa") || lower.includes("crown")) return workTypeIcon.crown;
    if (lower.includes("ponte") || lower.includes("bridge")) return workTypeIcon.bridge;
    if (lower.includes("prótese total") || lower.includes("dentadura")) return workTypeIcon.denture;
    if (lower.includes("inlay") || lower.includes("onlay")) return workTypeIcon.inlay;
    return workTypeIcon.default;
};

const getDaysInLab = (sentAt: Date) => {
    const diffTime = Math.abs(Date.now() - sentAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function PatientProtheticWorksSection({
    patientId,
    patientName,
    protheticWorks,
}: PatientProtheticWorksSectionProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <FlaskConical className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-black tracking-tight text-slate-800">
                        Trabalhos Protéticos & Laboratório
                    </h3>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {protheticWorks.length}
                    </span>
                </div>
                <Link
                    href={`/admin/trabalhos?q=${encodeURIComponent(patientName)}`}
                    className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
                    )}
                >
                    Ver todos
                </Link>
            </div>

            <div className="p-5">
                {protheticWorks.length > 0 ? (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
                        {protheticWorks.map((work) => {
                            const isDone = work.status === "DONE";
                            const sentDate = new Date(work.sentAt);
                            const daysInLab = getDaysInLab(sentDate);
                            const WorkIcon = getWorkTypeIcon(work.workName);
                            const isRecent = daysInLab <= 3 && !isDone;
                            const isOvertime = daysInLab > 14 && !isDone;

                            return (
                                <div
                                    key={work.id}
                                    className={cn(
                                        "group relative rounded-xl border p-4 transition-all duration-200 hover:shadow-md w-full",
                                        isDone
                                            ? "border-emerald-200 bg-linear-to-br from-white to-emerald-50/30 hover:border-emerald-300"
                                            : "border-amber-200 bg-linear-to-br from-white to-amber-50/30 hover:border-amber-300"
                                    )}
                                >
                                    {!isDone && (
                                        <div className="absolute -top-2 -right-2">
                                            {isOvertime ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    Atrasado
                                                </span>
                                            ) : isRecent ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    Recente
                                                </span>
                                            ) : null}
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all group-hover:scale-105",
                                                    isDone
                                                        ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                                                        : "bg-amber-100 border-amber-200 text-amber-700"
                                                )}
                                            >
                                                <WorkIcon className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-black text-slate-800 leading-tight">
                                                        {work.workName}
                                                    </p>
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-slate-400">🏷️</span> Lab:{" "}
                                                        <span className="font-black text-slate-700">{work.laboratory}</span>
                                                    </span>
                                                    {work.teethInvolved && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="text-slate-400">🦷</span>
                                                            <span className="font-black text-slate-700">{work.teethInvolved}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide border shadow-xs",
                                                    isDone
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                        : "bg-amber-100 text-amber-800 border-amber-200"
                                                )}
                                            >
                                                {isDone ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Concluído
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="h-3 w-3 animate-pulse" />
                                                        Pendente
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <CalendarRange className="h-3 w-3" />
                                                <span className="font-bold">Envio:</span>
                                                <span className="font-mono text-slate-700">
                                                    {sentDate.toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                            {!isDone && (
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    <span className="font-bold">Há</span>
                                                    <span className="font-mono text-slate-700">{daysInLab} dias</span>
                                                    <span className="text-slate-400">em laboratório</span>
                                                </div>
                                            )}
                                        </div>

                                        {!isDone && (
                                            <div className="flex w-full max-w-[160px] items-center gap-1.5">
                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                                                    <div
                                                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(100, (daysInLab / 21) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400">
                                                    {daysInLab > 21 ? "⏳ crítico" : "⏱️ normal"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/20 py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <FlaskConical className="h-6 w-6 opacity-50" />
                        </div>
                        <p className="max-w-xs text-xs font-semibold text-slate-400">
                            Nenhum trabalho protético solicitado para{" "}
                            <span className="text-slate-500">{patientName}</span>.
                        </p>
                        <p className="mt-1 text-[11px] text-slate-300">
                            Clique em “Ver todos” para iniciar um novo pedido.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}