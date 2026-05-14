import { Clock, Instagram, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { clinicInfo } from "@/data/services";

export function Footer() {
  return (
    <footer className="bg-primary-deep text-primary-foreground pt-10 pb-32 md:pb-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4 md:gap-0">
            <img src="/logoFooter.png" alt="Uteich Odontologia" className="h-20 w-20 md:h-28 md:w-28 object-contain" />
            <div className="flex items-center gap-2 text-[11px] text-primary-foreground/70 bg-white/5 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3 text-primary-soft flex-shrink-0" />
              <span>{clinicInfo.hours}</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-5">
            <div className="flex flex-col items-center md:items-end gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40 font-bold">Redes Sociais</span>
              <div className="flex gap-2.5">
                <a
                  href={clinicInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href={clinicInfo.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href={clinicInfo.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-[10px] text-primary-foreground/60 font-medium tracking-wider uppercase">
                {clinicInfo.doctor}
              </p>
              <p className="text-[9px] text-primary-foreground/30 uppercase tracking-[0.2em]">
                CRO {clinicInfo.cro}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-primary-foreground/40 uppercase tracking-widest font-medium">
          <p>© {new Date().getFullYear()} Uteich Odontologia.</p>
          <div className="flex gap-4">
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
