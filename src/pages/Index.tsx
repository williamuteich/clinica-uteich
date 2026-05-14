import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import BannerCarousel from "@/components/BannerCarousel";
import Banner from "@/components/banner";
import Services from "@/components/services";
import Abaout from "@/components/about";
import Depoiments from "@/components/depoiments";
import CardAgenda from "@/components/cardAgenda";

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
      <Services />
      <Abaout />
      <Depoiments />
      <CardAgenda />
    </Layout >
  );
};

export default Index;
