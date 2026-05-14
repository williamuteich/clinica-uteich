import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicInfo } from "@/data/services";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src="/logoHeader.png" alt="Uteich Odontologia" className="h-10 w-auto md:h-12" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${clinicInfo.emergencyPhone.replace(/\D/g, '')}`}
            className="flex items-center gap-2 text-sm font-medium text-primary-deep"
          >
            <Phone className="w-4 h-4" />
            {clinicInfo.whatsappFormatted}
          </a>

          {/*
          BOTÃO PARA REDIRECIONAR PARA A ÁREA ADMINISTRATIVA
          <Button asChild variant="ghost" size="icon" title="Área Administrativa" className="rounded-none">
            <Link to="/admin"><Lock className="w-4 h-4" /></Link>
          </Button>*/}

          <Button asChild className="h-9 rounded-none bg-primary px-4 py-0 text-xs font-semibold leading-none text-primary-foreground shadow-none hover:bg-primary-deep hover:shadow-none hover:translate-y-0">
            <Link to="/agendamento">Agendar</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-primary-deep"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "py-2 text-base font-medium transition-colors",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-none bg-primary text-primary-foreground hover:bg-primary-deep">
              <Link to="/agendamento" onClick={() => setIsOpen(false)}>
                Agendar Consulta
              </Link>
            </Button>
            {/*
               BOTÃO mobile PARA REDIRECIONAR PARA A ÁREA ADMINISTRATIVA 
            <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-primary">
              <Lock className="w-4 h-4" /> Área Administrativa
            </Link>
            */}
          </nav>
        </div>
      )}
    </header>
  );
}
