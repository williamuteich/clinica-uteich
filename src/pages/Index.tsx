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
  AlertCircle,
} from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";
import Banner from "@/components/banner";

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

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Uteich Odontologia | Clínica Odontológica em Cachoeirinha - RS"
        description="Atendimento 24h, implantes, ortodontia, clareamento dental e mais. Dr. Lenon Uteich - CRO 32301. Agende sua avaliação gratuita!"
        keywords="dentista cachoeirinha, clínica odontológica 24h, implante dentário, ortodontia, clareamento dental, emergência dentista"
        path="/"
      />
      <Banner />
      <BannerCarousel />
      <section id="servicos" className="py-20 bg-background">
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
                  {service.id === 'emergencia' ? (
                    <a
                      href={`tel:${clinicInfo.emergencyPhone.replace(/\D/g, '')}`}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-1"
                    >
                      Ligar Agora
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  ) : (
                    <Link
                      to={`/agendamento?servico=${service.id}`}
                      className="text-sm font-medium text-primary hover:text-dental-light transition-colors inline-flex items-center gap-1"
                    >
                      Agendar
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto items-center">
            <div className="space-y-12 animate-fade-in-left">
              <div className="text-center">
                <span className="text-dental-light font-medium text-sm uppercase tracking-wider">Por que nos escolher</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">
                  Excelência em cada{" "}
                  <span className="text-primary">detalhe</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { icon: Clock, title: "Atendimento 24h", desc: "Emergências atendidas a qualquer hora + horário normal Seg-Sex 8h-20h, Sáb 9h-18h" },
                  { icon: Award, title: "Profissionais Qualificados", desc: "Equipe especializada e em constante atualização" },
                  { icon: Heart, title: "Atendimento Humanizado", desc: "Cuidado personalizado para cada paciente" },
                  { icon: CheckCircle, title: "Tecnologia Avançada", desc: "Equipamentos modernos para melhores resultados" },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 items-start bg-card p-6 rounded-2xl shadow-sm border border-border">
                    <div className="w-14 h-14 rounded-xl bg-dental-pale flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Button size="lg" asChild>
                  <Link to="/sobre">Conheça Nossa Clínica</Link>
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
    </Layout >
  );
};

export default Index;
