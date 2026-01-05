import { FaWhatsapp } from "react-icons/fa";
import { clinicInfo } from "@/data/services";

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(clinicInfo.defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1">
      <span className="text-xs font-medium bg-white/90 text-slate-800 px-3 py-1 rounded-full shadow-sm mb-1">
        Tem alguma dúvida?
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 flex items-center justify-center"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366]/25 animate-pulse" aria-hidden="true" />
        <span className="relative w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <FaWhatsapp className="w-8 h-8" />
        </span>
      </a>
    </div>
  );
}
