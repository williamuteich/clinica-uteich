import { Phone, MessageCircle } from "lucide-react";
import { clinicInfo } from "@/data/services";

export function MobileContactBar() {
  const whatsappUrl = `https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(clinicInfo.defaultMessage)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border p-3 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <a
        href={`tel:${clinicInfo.emergencyPhone.replace(/\D/g, '')}`}
        className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-primary text-primary font-bold rounded-none text-sm transition-colors hover:bg-primary/5"
      >
        <Phone className="w-4 h-4" />
        Ligar
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-[1.5] flex items-center justify-center gap-2 h-12 bg-primary text-white font-bold rounded-none text-sm transition-colors hover:bg-primary-deep shadow-sm"
      >
        <MessageCircle className="w-4 h-4" />
        Agendar agora
      </a>
    </div>
  );
}
