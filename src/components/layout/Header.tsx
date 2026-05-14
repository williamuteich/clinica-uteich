import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicInfo } from "@/data/services";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/agendamento", label: "Agendar" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logoHeader.png" alt="Uteich Odontologia" className="h-11 w-auto" />
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
          <a href={`tel:${clinicInfo.emergencyPhone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            {clinicInfo.whatsappFormatted}
          </a>
          <Button asChild variant="ghost" size="icon" title="Área Administrativa">
            <Link to="/admin"><Lock className="w-4 h-4" /></Link>
          </Button>
          <Button asChild>
            <Link to="/agendamento">Agendar</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
            <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2">
              <Lock className="w-4 h-4" /> Área Administrativa
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
