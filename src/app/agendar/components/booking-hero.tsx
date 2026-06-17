import { ShieldCheck, Stethoscope, Clock, Smile } from "lucide-react";
import { BookingHeroProps } from "@/src/types/home/agendar";

export function BookingHero({ year }: BookingHeroProps) {
  return (
    <div className="hidden md:flex gradient-card text-white p-8 flex-col justify-between relative">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[16px_16px]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs">
          <ShieldCheck className="h-4 w-4 text-accent" />
          CRO 32301 · Dr. Lenon Uteich
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight leading-tight">
          Agende sua<br />Consulta em<br />
          <span className="text-accent-light">Poucos Passos.</span>
        </h1>
        <p className="mt-4 text-sm text-white/80 leading-relaxed">
          Escolha o procedimento de sua preferência, data e horário ideal.
          Nosso sistema verificará automaticamente a agenda da clínica e se você já possui cadastro.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Stethoscope className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold">Tecnologia de Ponta</p>
              <p className="text-[11px] text-white/70">Equipamentos modernos e técnicas avançadas.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold">Horários Flexíveis</p>
              <p className="text-[11px] text-white/70">Atendimento de Segunda a Sábado até as 19:30.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Smile className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold">Atendimento Sem Dor</p>
              <p className="text-[11px] text-white/70">Cuidado humanizado e conforto absoluto.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/60">
        <p>Uteich Odontologia © {year}</p>
        <p className="mt-1">Rua Papa João XXIII, 80 – Cachoeirinha - RS</p>
      </div>
    </div>
  );
}
