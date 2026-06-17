import { AlertCircle, Phone } from "lucide-react";
import { ErrorMessageAlertProps } from "@/src/types/home/agendar";

export function ErrorMessageAlert({ message, showEmergency }: ErrorMessageAlertProps) {
  return (
    <div className="mb-6 space-y-3 animate-in fade-in duration-300">
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold leading-relaxed">{message}</p>
      </div>
      {showEmergency && (
        <a
          href="tel:5551991581059"
          className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
        >
          <Phone className="h-4 w-4" />
          Botão de Emergência
        </a>
      )}
    </div>
  );
}
