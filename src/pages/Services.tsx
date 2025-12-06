import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { services, clinicInfo } from "@/data/services";
import {
  ClipboardCheck,
  Stethoscope,
  Crown,
  Smile,
  Target,
  Sparkles,
  Wrench,
  Clock,
  ArrowRight
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  Stethoscope,
  Crown,
  Smile,
  Target,
  Sparkles,
  Wrench,
};

const Services = () => {
  return (
    <Layout>
      <SEO
        title="Serviços Odontológicos | Uteich Odontologia"
        description="Implantes dentários, ortodontia, clareamento, próteses e mais. Equipamentos de última geração e profissionais especializados em Cachoeirinha."
        keywords="implante dentário cachoeirinha, ortodontia, clareamento dental, prótese dentária, tratamento de canal, extração de dente"
        path="/servicos"
      />
      <section className="relative py-20 gradient-hero overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{
          clipPath: "ellipse(80% 100% at 50% 100%)"
        }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Nossos Serviços
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Oferecemos tratamentos odontológicos completos com tecnologia de ponta e profissionais qualificados.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Stethoscope;
              const isEmergency = service.id === 'emergencia';
              return (
                <div
                  key={service.id}
                  className={`group rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in ${isEmergency
                    ? 'bg-red-600'
                    : 'bg-card'
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${isEmergency
                        ? 'bg-white/20'
                        : 'gradient-card'
                        }`}>
                        <Icon className={`w-8 h-8 ${isEmergency ? 'text-white' : 'text-primary-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${isEmergency ? 'text-white' : 'text-foreground'}`}>{service.name}</h3>
                        <p className={`mb-4 ${isEmergency ? 'text-white/90' : 'text-muted-foreground'}`}>{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 text-sm ${isEmergency ? 'text-white/80' : 'text-muted-foreground'}`}>
                            <Clock className="w-4 h-4" />
                            <span>~{service.duration} min</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className={isEmergency ? 'border-white text-white hover:bg-white hover:text-red-600 bg-transparent' : ''}
                            asChild
                          >
                            <Link to={`/agendamento?servico=${service.id}`} className="inline-flex items-center gap-2">
                              Agendar
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Não encontrou o que procura?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Entre em contato conosco pelo WhatsApp para tirar suas dúvidas ou agende uma avaliação gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a
                href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de agendar uma avaliação gratuita.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Agendar Avaliação Gratuita
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(' Olá! Tenho algumas dúvidas sobre os tratamentos odontológicos.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Fale Conosco
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
