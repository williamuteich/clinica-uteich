import { Phone, MessageCircle } from "lucide-react";

export function MobileContactBar() {
    const phoneUrl = "tel:5551991581059";
    const whatsappUrl = "https://api.whatsapp.com/send/?phone=5551991581059&text=Ol%C3%A1%21+Gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+os+servi%C3%A7os+da+Uteich+Odontologia.&type=phone_number&app_absent=0";

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border p-3 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <a
                href={phoneUrl}
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
