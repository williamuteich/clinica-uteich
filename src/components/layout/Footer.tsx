
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail, Instagram, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { clinicInfo } from "@/data/services";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="container mx-auto px-4 pt-0 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col items-center md:items-start gap-4">
              <img src={`${import.meta.env.BASE_URL}logoFooter.png`} alt="Uteich Odontologia" className="h-16 w-auto" />
              <p className="text-sm text-primary-foreground/80 text-center md:text-left max-w-xs leading-relaxed">
                Cuidando do seu sorriso com excelência e dedicação. Tecnologia de ponta e atendimento humanizado.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <a
                href={clinicInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dental-light/20 flex items-center justify-center hover:bg-dental-light/30 transition-colors"
                aria-label="Visitar Instagram da Uteich Odontologia"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={clinicInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dental-light/20 flex items-center justify-center hover:bg-dental-light/30 transition-colors"
                aria-label="Visitar Facebook da Uteich Odontologia"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(clinicInfo.defaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-dental-light/20 flex items-center justify-center hover:bg-dental-light/30 transition-colors"
                aria-label="Falar com a Uteich Odontologia pelo WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Links Rápidos</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Início</Link>
              <Link to="/servicos" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Serviços</Link>
              <Link to="/sobre" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Sobre Nós</Link>
              <Link to="/agendamento" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Agendamento</Link>
              <Link to="/cases" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Cases</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Serviços</h4>
            <nav className="flex flex-col gap-3">
              <span className="text-primary-foreground/80 text-sm">Clínico Geral</span>
              <span className="text-primary-foreground/80 text-sm">Prótese e Implante</span>
              <span className="text-primary-foreground/80 text-sm">Ortodontia</span>
              <span className="text-primary-foreground/80 text-sm">Estética Dental</span>
              <span className="text-primary-foreground/80 text-sm">Tratamento de Canal</span>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-dental-sky flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80 text-sm">{clinicInfo.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-dental-sky flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{clinicInfo.whatsappFormatted}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-dental-sky flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">Atendimento {clinicInfo.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-dental-sky flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{clinicInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Uteich Odontologia. Todos os direitos reservados.
          </p>
          <p className="text-primary-foreground/60 text-sm">
            {clinicInfo.doctor} - CRO {clinicInfo.cro}
          </p>
        </div>
      </div>
    </footer>
  );
}
