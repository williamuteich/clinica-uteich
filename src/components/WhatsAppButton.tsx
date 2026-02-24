import { FaWhatsapp } from "react-icons/fa";
import { clinicInfo } from "@/data/services";

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(clinicInfo.defaultMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8" />
    </a>
  );
}
