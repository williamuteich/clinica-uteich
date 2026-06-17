import { StepIndicatorProps } from "@/src/types/home/agendar";

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        <span>Passo {step} de 2</span>
        <span>{step === 1 ? "Dados Pessoais" : "Serviço e Data"}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
    </div>
  );
}
