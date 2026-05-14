import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gift,
  Sparkles,
} from "lucide-react";

type BannerSlide = {
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  icon: React.ComponentType<{ className?: string }>;
  background: string;
};

const slides: BannerSlide[] = [
  {
    badge: "Promoção",
    title: "Avaliação ortodôntica gratuita",
    description:
      "Agende este mês e ganhe avaliação completa + plano de tratamento personalizado.",
    ctaLabel: "Quero agendar",
    ctaHref: "#contato",
    icon: Gift,
    background: "linear-gradient(120deg, var(--primary-deep), var(--primary))",
  },
  {
    badge: "Novidade",
    title: "Clareamento dental a laser",
    description:
      "Resultado em apenas uma sessão, com tecnologia segura e indolor.",
    ctaLabel: "Saiba mais",
    ctaHref: "#servicos",
    icon: Sparkles,
    background: "linear-gradient(120deg, var(--primary), var(--primary-soft))",
  },
  {
    badge: "Facilidade",
    title: "Parcelamento em até 12x sem juros",
    description:
      "Cuide do seu sorriso sem comprometer o orçamento. Aceitamos todos os cartões.",
    ctaLabel: "Falar com a clínica",
    ctaHref: "#contato",
    icon: Calendar,
    background: "linear-gradient(120deg, var(--primary-deep), oklch(0.45 0.11 240))",
  },
];

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      aria-label="Promoções e novidades"
      className="py-10 md:py-14 bg-background"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className="relative overflow-hidden rounded-none bg-[#0789b7]"
          style={{ boxShadow: "var(--shadow-elevated)" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide) => {
              const Icon = slide.icon;

              return (
                <article
                  key={slide.title}
                  className="min-w-full text-primary-foreground p-6 md:py-10 md:px-20"
                  style={{ background: slide.background || "linear-gradient(120deg, #0f5f86, #0789b7)" }}
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

                    <Link
                      to={slide.ctaHref}
                      className="mt-5 md:mt-0 inline-flex items-center justify-center gap-2 bg-white text-primary-deep px-5 py-3 text-sm font-semibold rounded-none hover:bg-primary-soft transition-colors whitespace-nowrap"
                    >
                      {slide.ctaLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Banner anterior"
            className="hidden md:grid place-items-center absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/15 hover:bg-white/25 text-white rounded-none border border-white/20"
            onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Próximo banner"
            className="hidden md:grid place-items-center absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/15 hover:bg-white/25 text-white rounded-none border border-white/20"
            onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ir para banner ${index + 1}`}
                className={`h-1.5 rounded-none transition-all ${index === activeIndex ? "w-6 bg-white" : "w-2 bg-white/40"}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BannerCarousel;
