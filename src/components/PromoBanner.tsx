import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

import atendimento24hrs from "@/assets/banners/atendimento_24hrs.png";
import clinicaEspecializada from "@/assets/banners/clinica_especializada.png";
import promoSexta from "@/assets/banners/promo_sexta.png";
import inauguracao from "@/assets/banners/inauguracao.png";

import atendimento24hrsMobile from "@/assets/banners/atendimento_24hrs_mobile.png";
import clinicaEspecializadaMobile from "@/assets/banners/clinica_especializada_mobile.png";
import promoSextaMobile from "@/assets/banners/promo_sexta_mobile.png";
import inauguracaoMobile from "@/assets/banners/inauguracao_mobile.png";

interface BannerData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  image: string;
  mobileImage: string;
}

const banners: BannerData[] = [
  {
    id: 1,
    title: "Atendimento 24 Horas",
    subtitle: "Sempre à sua disposição",
    description: "Estamos prontos para atender você a qualquer hora, todos os dias da semana.",
    ctaText: "Agendar Consulta",
    ctaLink: "/agendamento",
    bgGradient: "linear-gradient(135deg, hsl(193 65% 32%) 0%, hsl(195 60% 38%) 100%)",
    image: atendimento24hrs,
    mobileImage: atendimento24hrsMobile,
  },
  {
    id: 2,
    title: "Clínica Especializada",
    subtitle: "Excelência em Odontologia",
    description: "Profissionais especializados e equipamentos de última geração para o seu sorriso.",
    ctaText: "Conheça Nossa Clínica",
    ctaLink: "/sobre",
    bgGradient: "linear-gradient(135deg, hsl(195 60% 38%) 0%, hsl(193 70% 54%) 100%)",
    image: clinicaEspecializada,
    mobileImage: clinicaEspecializadaMobile,
  },
  {
    id: 3,
    title: "Promoção Sexta-Feira",
    subtitle: "Oferta Especial",
    description: "Aproveite condições especiais para tratamentos toda sexta-feira.",
    ctaText: "Ver Promoções",
    ctaLink: "/agendamento",
    bgGradient: "linear-gradient(135deg, hsl(193 70% 54%) 0%, hsl(193 70% 72%) 100%)",
    image: promoSexta,
    mobileImage: promoSextaMobile,
  },
  {
    id: 4,
    title: "Inauguração",
    subtitle: "Venha nos conhecer",
    description: "Celebre conosco a inauguração da nossa clínica com ofertas exclusivas.",
    ctaText: "Aproveitar Promoção",
    ctaLink: "/agendamento",
    bgGradient: "linear-gradient(135deg, hsl(193 65% 32%) 0%, hsl(195 60% 38%) 100%)",
    image: inauguracao,
    mobileImage: inauguracaoMobile,
  },
];

export function PromoBanner() {
  const plugin = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true })
  );

  return (
    <section className="w-full bg-muted/30 border-y border-border/50 hidden md:block">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <div className="relative w-full overflow-hidden">
                <picture>
                  <source media="(max-width: 768px)" srcSet={banner.mobileImage} />
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-auto object-cover aspect-auto md:aspect-[3/1] md:min-h-[200px]"
                  />
                </picture>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-8 bg-white/10 hover:bg-white/20 border-white/20 text-white hidden md:flex" />
        <CarouselNext className="right-8 bg-white/10 hover:bg-white/20 border-white/20 text-white hidden md:flex" />
      </Carousel>
    </section>
  );
}
