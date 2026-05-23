"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "#inicio", label: "Início" },
    { href: "#servicos", label: "Serviços" },
    { href: "#sobre", label: "Sobre" },
    { href: "#depoimentos", label: "Depoimentos" },
    { href: "#contato", label: "Contato" },
];

export function HeaderHome() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#") && pathname === "/") {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = element.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
            setIsOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
            <div className="mx-auto flex max-w-[1050px] items-center justify-between px-4 h-[58px]">
                <Link href="/" className="flex shrink-0 items-center gap-2">
                    <img
                        src="/logoHeader.png"
                        alt="Uteich Odontologia"
                        className="h-10 w-auto object-contain"
                    />
                </Link>

                <nav className="hidden items-center gap-7 text-xs font-medium text-foreground/80 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link.href)}
                            className="transition-colors hover:text-primary text-muted-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <a
                        href="tel:5551991581059"
                        className="flex items-center gap-2 text-xs font-medium text-primary-deep"
                    >
                        <Phone className="w-4 h-4" />
                        (51) 99158-1059
                    </a>

                    <Link
                        href="/agendar"
                        className={cn(
                            buttonVariants({ variant: "default" }),
                            "h-8 rounded-none bg-primary px-3 py-0 text-xs font-semibold leading-none text-primary-foreground shadow-none hover:bg-primary-deep hover:shadow-none hover:translate-y-0 inline-flex items-center justify-center"
                        )}
                    >
                        Agendar
                    </Link>
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
                    <nav className="mx-auto flex max-w-[1050px] flex-col gap-1 px-4 py-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleLinkClick(e, link.href)}
                                className="py-2 text-base font-medium transition-colors text-muted-foreground"
                            >
                                {link.label}
                            </a>
                        ))}
                        <Link
                            href="/agendar"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "mt-2 rounded-none bg-primary text-primary-foreground hover:bg-primary-deep flex justify-center items-center"
                            )}
                        >
                            Agendar Consulta
                        </Link>
                        <a
                            href="tel:5551991581059"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                                "mt-1 rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex justify-center items-center"
                            )}
                        >
                            <Phone className="mr-2 h-4 w-4" />
                            Emergência 24h
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
