import { motion } from "framer-motion";
import { Calendar, Loader2, ChevronLeft, CalendarCheck, AlertCircle } from "lucide-react";
import { StepTwoProps } from "@/src/types/home/agendar";

export function StepTwoForm({
  minDate,
  selectedDate,
  onDateChange,
  loadingSlots,
  availableTimeSlots,
  selectedTime,
  setSelectedTime,
  onBack,
  submitting,
  onSubmit,
}: StepTwoProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-primary-deep">Quando deseja ser atendido(a)?</h2>
        <p className="text-xs text-muted-foreground mt-1">Escolha um dia e horário de segunda a sábado.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Escolha a Data <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              required
              min={minDate}
              value={selectedDate}
              onChange={onDateChange}
              className="w-full h-11 pl-10 pr-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 bg-white"
            />
          </div>
        </div>
        {selectedDate && (
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 items-center justify-between">
              <span>Horários Disponíveis</span>
              {loadingSlots && (
                <span className="text-primary font-bold animate-pulse flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Verificando...
                </span>
              )}
            </label>
            {loadingSlots ? (
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-9 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Nenhum horário disponível para esta data.
              </div>
            ) : (
              <div className="max-h-[160px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableTimeSlots.map((timeStr) => {
                    const selected = selectedTime === timeStr;
                    return (
                      <button
                        key={timeStr}
                        type="button"
                        onClick={() => setSelectedTime(timeStr)}
                        className={`h-9 text-xs font-bold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${selected
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-primary/5"
                          }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Intervalo de 15 min garantido para evitar atrasos e aglomerações.
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 h-11 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          disabled={submitting || !selectedDate || !selectedTime}
          onClick={onSubmit}
          className="flex-1 h-11 bg-primary hover:bg-primary-deep text-white font-bold rounded-xl transition-all shadow-button hover:-translate-y-px active:translate-y-0 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Agendando...
            </>
          ) : (
            <>
              Confirmar Agendamento
              <CalendarCheck className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
