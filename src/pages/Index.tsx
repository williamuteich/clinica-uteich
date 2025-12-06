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
  CheckCircle,
  Clock,
  Award,
  Heart,
  AlertCircle
} from "lucide-react";
import heroImage from "@/assets/hero-dental.jpg";
import bgPatientImage from "@/assets/img_pacient.jpg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  ClipboardCheck,
  Stethoscope,
  Crown,
  Smile,
  Target,
  Sparkles,
  Wrench,
};

import { PromoBanner } from "@/components/PromoBanner";

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Uteich Odontologia | Clínica Odontológica em Cachoeirinha - RS"
        description="Atendimento 24h, implantes, ortodontia, clareamento dental e mais. Dr. Lenon Uteich - CRO 32301. Agende sua avaliação gratuita!"
        keywords="dentista cachoeirinha, clínica odontológica 24h, implante dentário, ortodontia, clareamento dental, emergência dentista"
        path="/"
      />
      <section className="relative min-h-[75vh] lg:min-h-[90vh] flex items-start pt-8 md:pt-24 lg:pt-0 lg:items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(16, 97, 128, 0.95) 0%, rgba(25, 146, 193, 0.90) 50%, rgba(7, 174, 229, 0.85) 100%), url(${bgPatientImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-background hidden lg:block" style={{
          clipPath: "ellipse(80% 100% at 50% 100%)"
        }} />

        <div className="absolute top-20 left-10 w-64 h-64 bg-dental-sky/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-dental-light/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="text-primary-foreground space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-dental-sky" />
                <span>Promoções de Inauguração</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Seu sorriso merece o{" "}
                <span className="text-dental-sky">melhor cuidado</span>
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-lg">
                Tecnologia de ponta e atendimento humanizado para transformar seu sorriso.
                Agende sua avaliação gratuita.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-red-600 text-white font-semibold hover:bg-red-700 shadow-button hover:shadow-hover hover:-translate-y-0.5"
                  asChild
                >
                  <a
                    href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Preciso de atendimento de emergência 24h.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Emergência 24h
                  </a>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/servicos">Nossos Serviços</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <p className="text-3xl font-bold text-white">24h</p>
                  <p className="text-sm text-white/90">Emergências</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">7+</p>
                  <p className="text-sm text-white/90">Especialidades</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">100%</p>
                  <p className="text-sm text-white/90">Satisfação</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block animate-fade-in animation-delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="Dr. Lenon Uteich - Uteich Odontologia"
                  className="w-full h-[670px] object-cover"
                  style={{
                    objectPosition: '50% 30%',
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0) scale(1.001)',
                    filter: 'contrast(1.05) brightness(1.02) saturate(1.1)',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-dental-pale flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{clinicInfo.doctor}</p>
                      <p className="text-sm text-white/80">CRO {clinicInfo.cro}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 lg:mt-16">
        <PromoBanner />
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
            <span className="text-dental-light font-medium text-sm uppercase tracking-wider">Nossos Serviços</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              Tratamentos completos para sua{" "}
              <span className="text-primary">saúde bucal</span>
            </h2>
            <p className="text-muted-foreground">
              Oferecemos uma gama completa de tratamentos odontológicos com profissionais qualificados e equipamentos modernos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Stethoscope;
              const isEmergency = service.id === 'emergencia';
              return (
                <div
                  key={service.id}
                  className={`group rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-2 animate-fade-in ${isEmergency
                    ? 'bg-card border-2 border-red-500 hover:border-red-600'
                    : 'bg-card'
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${isEmergency
                    ? 'bg-red-500 text-white'
                    : 'gradient-card'
                    }`}>
                    <Icon className={isEmergency ? "w-7 h-7 text-white" : "w-7 h-7 text-primary-foreground"} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isEmergency ? 'text-red-600' : 'text-foreground'
                    }`}>{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <Link
                    to={`/agendamento?servico=${service.id}`}
                    className="text-sm font-medium text-primary hover:text-dental-light transition-colors inline-flex items-center gap-1"
                  >
                    Agendar
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-left">
              <div>
                <span className="text-dental-light font-medium text-sm uppercase tracking-wider">Por que nos escolher</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">
                  Excelência em cada{" "}
                  <span className="text-primary">detalhe</span>
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Clock, title: "Atendimento 24h", desc: "Emergências atendidas a qualquer hora + horário normal Seg-Sex 8h-20h, Sáb 9h-18h" },
                  { icon: Award, title: "Profissionais Qualificados", desc: "Equipe especializada e em constante atualização" },
                  { icon: Heart, title: "Atendimento Humanizado", desc: "Cuidado personalizado para cada paciente" },
                  { icon: CheckCircle, title: "Tecnologia Avançada", desc: "Equipamentos modernos para melhores resultados" },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-dental-pale flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" asChild>
                <Link to="/sobre">Conheça Nossa Clínica</Link>
              </Button>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="bg-gradient-to-br from-dental-teal to-dental-medium p-8 rounded-3xl text-primary-foreground">
                <h3 className="text-2xl font-bold mb-6">Promoção de Inauguração</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky" />
                    <span>Avaliação gratuita</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky" />
                    <span>Clareamento com desconto especial</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky" />
                    <span>Condições especiais para implantes</span>
                  </li>
                </ul>
                <p className="text-sm text-primary-foreground/80 mb-4">Promoção válida até 31/12/2025</p>
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/agendamento">Aproveitar Promoção</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 gradient-hero relative overflow-hidden mb-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Pronto para transformar seu sorriso?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Agende sua avaliação gratuita e descubra como podemos ajudá-lo a conquistar o sorriso dos seus sonhos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
            <Button variant="hero" size="lg" asChild>
              <Link to="/agendamento">Agendar Avaliação Gratuita</Link>
            </Button>
            <Button variant="whatsapp" size="lg" asChild>
              <a href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(clinicInfo.defaultMessage)}`} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
