import { HeaderHome } from "./components/home/HeaderHome";
import BannerHome from "./components/home/BannerHome";
import { FooterHome } from "./components/home/FooterHome";
import { ServicesHome } from "./components/home/Services";
import { SchedulingCTA } from "./components/home/SchedulingCTA";
import { AboutHome } from "./components/home/About";
import DepoimentsHome from "./components/home/Depoiments";
import { CardAgendaHome } from "./components/home/CardAgenda";
import { WhatsAppButton } from "./components/home/WhatsappButton";
import { MobileContactBar } from "./components/home/MobileContactBar";

export default async function LoginPage() {

  return (
    <main className="flex min-h-screen w-full flex-col">
      <HeaderHome />
      <BannerHome />
      <SchedulingCTA />
      <ServicesHome />
      <AboutHome />
      <DepoimentsHome />
      <CardAgendaHome />
      <FooterHome />
      <WhatsAppButton />
      <MobileContactBar />
    </main>
  );
}