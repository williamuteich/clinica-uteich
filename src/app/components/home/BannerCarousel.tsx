"use client";

import * as React from "react";
import { ArrowRight, CreditCard, Smile, ClipboardCheck } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import { BannerCarouselType } from "@/src/types/home/bannerCarousel";

const slides: BannerCarouselType[] = [
    {
        badge: "Promoção",
        title: "Avaliação ortodôntica gratuita",
        description:
            "Agende este mês e ganhe avaliação completa + plano de tratamento personalizado.",
        ctaLabel: "Quero agendar",
        ctaHref: `https://api.whatsapp.com/send/?phone=5551991581059&text=${encodeURIComponent("Olá! Vi no site e gostaria de agendar minha AVALIAÇÃO ORTODÔNTICA GRATUITA.")}`,
        icon: ClipboardCheck,
    },
    {
        badge: "Novidade",
        title: "Clareamento dental a laser",
        description:
            "Resultado em apenas uma sessão, com tecnologia segura e indolor.",
        ctaLabel: "Saiba mais",
        ctaHref: `https://api.whatsapp.com/send/?phone=5551991581059&text=${encodeURIComponent("Olá! Gostaria de saber mais sobre o CLAREAMENTO DENTAL A LASER.")}`,
        icon: Smile,
    },
    {
        badge: "Facilidade",
        title: "Condições de pagamento facilitadas",
        description:
            "Cuide do seu sorriso com flexibilidade no orçamento. Aceitamos diversos cartões.",
        ctaLabel: "Falar com a clínica",
        ctaHref: `https://api.whatsapp.com/send/?phone=5551991581059&text=${encodeURIComponent("Olá! Gostaria de saber mais sobre as CONDIÇÕES DE PAGAMENTO facilitadas.")}`,
        icon: CreditCard,
    },
];

export function BannerCarousel() {
    return (
        <section
            id="promocoes"
            aria-label="Promoções e novidades"
            className="py-10 md:py-14 bg-background"
        >
            <div className="mx-auto max-w-[1050px] px-12 md:px-14">
                <div className="relative w-full">
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {slides.map((slide) => {
                                const Icon = slide.icon;

                                return (
                                    <CarouselItem
                                        key={slide.title}
                                        className="basis-full"
                                    >
                                        <article
                                            className="text-primary-foreground p-6 md:py-10 md:px-20 min-h-[220px] flex flex-col justify-center bg-primary-deep rounded-none"
                                        >
                                            <div className="md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
                                                <div>
                                                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-none border border-white/20">
                                                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {slide.badge}
                                                    </span>
                                                    <h3 className="mt-3 text-2xl md:text-3xl font-bold leading-tight">
                                                        {slide.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm md:text-base text-white/85 max-w-xl">
                                                        {slide.description}
                                                    </p>
                                                </div>

                                                <a
                                                    href={slide.ctaHref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-5 md:mt-0 inline-flex items-center justify-center gap-2 bg-white text-primary-deep px-5 py-3 text-sm font-semibold rounded-none hover:bg-primary-soft transition-colors whitespace-nowrap"
                                                >
                                                    {slide.ctaLabel}
                                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                </a>
                                            </div>
                                        </article>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}

export default BannerCarousel;
