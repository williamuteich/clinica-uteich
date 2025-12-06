import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { clinicInfo } from "@/data/services";
import { Award, Heart, Target, CheckCircle, Clock, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-dental.jpg";

const About = () => {
  return (
    <Layout>
      <SEO
        title="Sobre Nós | Dr. Lenon Uteich - CRO 32301"
        description="Conheça o Dr. Lenon Uteich e a história da Uteich Odontologia. Atendimento humanizado com tecnologia de ponta em Cachoeirinha - RS."
        keywords="dr lenon uteich, dentista cachoeirinha, clínica odontológica cachoeirinha, CRO 32301"
        path="/sobre"
      />
      <section className="relative py-20 gradient-hero overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-background" style={{
          clipPath: "ellipse(80% 100% at 50% 100%)"
        }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Sobre
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Conheça a história e os valores que fazem da Uteich Odontologia referência em saúde bucal.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt={clinicInfo.doctor}
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
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

            <div className="space-y-6 animate-fade-in-right">
              <span className="text-dental-light font-medium text-sm uppercase tracking-wider">Minha História</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Cuidando de sorrisos com{" "}
                <span className="text-primary">dedicação e excelência</span>
              </h2>
              <p className="text-muted-foreground">
                A Uteich Odontologia nasceu do meu sonho de oferecer tratamentos odontológicos de alta qualidade
                com um atendimento verdadeiramente humanizado. Como {clinicInfo.doctor} (CRO {clinicInfo.cro}),
                tenho o compromisso de combinar tecnologia de ponta com o cuidado e atenção que cada paciente merece.
              </p>
              <p className="text-muted-foreground">
                Minha missão é transformar sorrisos e devolver a autoestima dos meus pacientes,
                oferecendo soluções completas em odontologia com um atendimento personalizado e acolhedor.
              </p>

              <div className="bg-dental-pale rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-light flex-shrink-0" />
                    <span className="text-foreground">Atendimento personalizado e individual</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-light flex-shrink-0" />
                    <span className="text-foreground">Atenção exclusiva em cada consulta</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-light flex-shrink-0" />
                    <span className="text-foreground">Formação e atualização constante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-dental-light font-medium text-sm uppercase tracking-wider">Meus Valores</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">
              O que me move
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Humanização", desc: "Atendimento acolhedor e personalizado para cada paciente" },
              { icon: Award, title: "Excelência", desc: "Comprometimento com os mais altos padrões de qualidade" },
              { icon: Target, title: "Inovação", desc: "Tecnologia de ponta para melhores resultados" },
              { icon: Sparkles, title: "Dedicação", desc: "Cuidado exclusivo e atencioso em cada tratamento" },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-left">
              <div>
                <span className="text-dental-light font-medium text-sm uppercase tracking-wider">Diferenciais</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">
                  Por que escolher a{" "}
                  <span className="text-primary">Uteich Odontologia?</span>
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Clock, title: "Atendimento 24h", desc: "Emergências atendidas a qualquer hora + horário normal Seg-Sex 8h-20h, Sáb 9h-18h" },
                  { icon: Award, title: "Profissional Qualificado", desc: "Especialização e constante atualização técnica" },
                  { icon: Heart, title: "Atendimento Humanizado", desc: "Cuidado personalizado e exclusivo para você" },
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
                <Link to="/agendamento">Agendar Consulta</Link>
              </Button>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="bg-gradient-to-br from-dental-teal to-dental-medium p-8 rounded-3xl text-primary-foreground">
                <h3 className="text-2xl font-bold mb-6">Nossa Estrutura</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky flex-shrink-0" />
                    <span>Consultório equipado com tecnologia de ponta</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky flex-shrink-0" />
                    <span>Ambiente moderno e acolhedor</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky flex-shrink-0" />
                    <span>Protocolos rigorosos de biossegurança</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dental-sky flex-shrink-0" />
                    <span>Raio-X digital e equipamentos modernos</span>
                  </li>
                </ul>
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/cases">Ver Cases de Sucesso</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
