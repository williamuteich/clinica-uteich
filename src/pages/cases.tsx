import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { clinicInfo } from "@/data/services";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
import imgClareamentoAntes from "@/assets/img_Clareamento_antes.jpg";
import imgClareamentoDepois from "@/assets/img_Clareamento_depois.jpg";
import imgEsteticaAntes from "@/assets/img_esteticaDental_antes.jpg";
import imgEsteticaDepois from "@/assets/img_esteticaDental_depois.jpg";
import imgImplanteAntes from "@/assets/img_implante_antes.jpg";
import imgImplanteDepois from "@/assets/img_implante_depois.jpg";

const cases = [
  {
    id: 1,
    title: "Limpeza Profunda",
    testimonial: "Sempre tive vergonha do meu sorriso amarelado. Após o clareamento na Uteich, minha autoestima mudou completamente! O resultado superou minhas expectativas.",
    treatments: ["Limpeza Profunda", "Profilaxia"],
    imageBefore: imgClareamentoAntes,
    imageAfter: imgClareamentoDepois
  },
  {
    id: 2,
    title: "Estética Dental e Clareamento",
    testimonial: "Remoção de cárie nos dentes da frente.",
    treatments: ["Restauração Estética", "Resina Composta"],
    imageBefore: imgEsteticaAntes,
    imageAfter: imgEsteticaDepois
  },
  {
    id: 3,
    title: "Implante Dentário",
    testimonial: "Perdi um dente frontal e tinha dois debaixo quebrados. O implante ficou perfeito, ninguém nota a diferença. Voltei a sorrir sem medo!",
    treatments: ["Implante Unitário", "Coroa de Porcelana"],
    imageBefore: imgImplanteAntes,
    imageAfter: imgImplanteDepois
  }
];

const Cases = () => {
  const [currentCase, setCurrentCase] = useState(0);
  const [showBefore, setShowBefore] = useState(true);

  const nextCase = () => {
    setCurrentCase((prev) => (prev + 1) % cases.length);
  };

  const prevCase = () => {
    setCurrentCase((prev) => (prev - 1 + cases.length) % cases.length);
  };

  const caseData = cases[currentCase];

  return (
    <Layout>
      <SEO
        title="Cases de Sucesso | Transformações Reais - Uteich Odontologia"
        description="Veja antes e depois de clareamento dental, implantes, ortodontia e mais. Depoimentos reais de pacientes satisfeitos em Cachoeirinha."
        keywords="antes e depois clareamento dental, transformações dentais, cases odontologia, depoimentos pacientes"
        path="/cases"
      />
      <section className="relative py-20 gradient-hero overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{
          clipPath: "ellipse(80% 100% at 50% 100%)"
        }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Cases de Sucesso
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Veja as transformações reais dos nossos pacientes e inspire-se para alcançar o sorriso dos seus sonhos.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={prevCase}
                className="w-12 h-12 rounded-full bg-card shadow-card hover:shadow-hover flex items-center justify-center transition-all hover:scale-110"
                aria-label="Case anterior"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>

              <div className="flex gap-2">
                {cases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCase(index)}
                    className={`h-2 rounded-full transition-all ${index === currentCase
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    aria-label={`Ir para case ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextCase}
                className="w-12 h-12 rounded-full bg-card shadow-card hover:shadow-hover flex items-center justify-center transition-all hover:scale-110"
                aria-label="Próximo case"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-muted">
                  {caseData.imageBefore && caseData.imageAfter ? (
                    <img
                      src={showBefore ? caseData.imageBefore : caseData.imageAfter}
                      alt={`${caseData.title} - ${showBefore ? 'Antes' : 'Depois'}`}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                          <svg className="w-12 h-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Espaço reservado para imagens</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{showBefore ? "Antes" : "Depois"}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {showBefore ? "Antes" : "Depois"}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant={showBefore ? "default" : "outline"}
                    onClick={() => setShowBefore(true)}
                    className="flex-1"
                  >
                    Antes
                  </Button>
                  <Button
                    variant={!showBefore ? "default" : "outline"}
                    onClick={() => setShowBefore(false)}
                    className="flex-1"
                  >
                    Depois
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    {caseData.title}
                  </h2>
                </div>

                <div className="bg-dental-pale rounded-2xl p-6">
                  <p className="text-lg text-foreground italic leading-relaxed">
                    {caseData.testimonial}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Tratamentos Realizados:</h3>
                  <div className="space-y-2">
                    {caseData.treatments.map((treatment, index) => (
                      <div key={index} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-5 h-5 text-dental-sky" />
                        <span>{treatment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi os cases de sucesso e gostaria de agendar uma avaliação.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Quero Transformar Meu Sorriso
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Pronto para Transformar Seu Sorriso?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Agende sua avaliação gratuita e descubra como podemos ajudar você a alcançar o sorriso perfeito.
          </p>
          <Button size="lg" asChild>
            <a
              href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de agendar uma avaliação gratuita.')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Agendar Avaliação Gratuita
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Cases;
