import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicInfo } from "@/data/services";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/agendamento", label: "Agendar" },
  { href: "/cases", label: "Cases" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logoHeader.png" alt="Uteich Odontologia" className="h-16 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href={`tel:${clinicInfo.whatsapp}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              {clinicInfo.whatsappFormatted}
            </a>
            <Button asChild>
              <Link to="/agendamento">Agendar Consulta</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-base font-medium py-2 transition-colors",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2">
              <Link to="/agendamento" onClick={() => setIsOpen(false)}>
                Agendar Consulta
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
