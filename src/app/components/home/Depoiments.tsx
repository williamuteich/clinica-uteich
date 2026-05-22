"use client";

import { MessageSquare, ArrowRight, ExternalLink, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";

type Testimonial = {
    id: number;
    text: string;
    author: string;
    image: string;
    rating: number;
};

const testimonials: Testimonial[] = [
    {
        id: 1,
        text: "Minha Mãe , meu esposo foram atendidos .. pessoal gente boa , muito atenciosos simpáticos .... amei e recomendo de olhos fechados .. Pois são seres humanos abençoados",
        author: "Andreza Valim",
        image: "/depoimentos/Andreza Valim.png",
        rating: 5,
    },
    {
        id: 2,
        text: "Ótimo atendimento, serviço muito bom e com preços bem acessíveis",
        author: "Kelvyn",
        image: "/depoimentos/Kelvyn.png",
        rating: 5,
    },
    {
        id: 3,
        text: "Entrei em contato às 3h da manhã, prontamente o doutor Lenon respondeu, e me atendeu em 20 minutos após o contato. Eu estava com um dente quebrado que inflamou, muita dor; dr extraiu o dente, problema resolvido. Excelente profissional, gentil e cuidadoso; recomendo!",
        author: "Valéria Viega",
        image: "/depoimentos/Valéria Viega.png",
        rating: 5,
    },
    {
        id: 4,
        text: "Atendimento diferenciado, precisamos de uma emergência a noite, chegamos lá recepcionista nos atendeu muito bem, simpática, muito profissional, doutor super atencioso, extremamente profissional, educado, super recomendo concerteza ganhou mais um cliente, parabéns pelo atendimento, profissionalismo",
        author: "Fabricio Viana",
        image: "/depoimentos/Fabricio Viana.png",
        rating: 5,
    },
    {
        id: 5,
        text: "Gostaria de dar meu depoimento sobre o meu atendimento, gostaria de agradecer a esse dr maravilhoso,dr Lenon obrigado pelo atendimento, pela paciência que teve comigo. Atendimento impecável.",
        author: "Deise Fardin Alves",
        image: "/depoimentos/Deise Fardin Alves.png",
        rating: 5,
    },
    {
        id: 6,
        text: "Somente agradecer esse dentista maravilhoso, minha mãe está com dor de dente vai fazer um mês foi em todos dentistas possíveis, fez mil e um RX e ninguém resolvia o problema, agora por último ela só queria extrair o dente pois não aguentava mais de dor e todos os lugares queriam fazer mais rx , ou tratamento de canal que não tínhamos condições de fazer no momento ele foi o único que atendeu e solucionou o problema prontamente ,Em menos de uma hora..... sem querer enfiar mais serviços e cobranças absurdas 🙏🏻",
        author: "Gabi Souza",
        image: "/depoimentos/Gabi Souza.png",
        rating: 5,
    },
    {
        id: 7,
        text: "Fui na Ortodontic da Borges. Recebi um atendimento impecável da Karen ! Humanizado e cuidadosa no atendimento !🤎",
        author: "Bruna Fraga",
        image: "/depoimentos/Bruna Fraga.png",
        rating: 5,
    },
    {
        id: 8,
        text: "Dr. Muito atencioso",
        author: "Rafael Oliveira",
        image: "/depoimentos/Rafael Oliveira.png",
        rating: 5,
    },
];

const PremiumStar = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
    return (
        <figure className="bg-white border border-border/50 p-6 md:p-7 rounded-none shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-[350px] w-full">
            <div className="flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <PremiumStar key={i} />
                ))}
            </div>
            <div className="mt-5 grow overflow-y-auto pr-2 custom-scrollbar text-[13px] text-foreground/80 leading-relaxed italic">
                <blockquote>
                    "{testimonial.text}"
                </blockquote>
            </div>
            <figcaption className="mt-6 pt-5 border-t border-border/40 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary/10">
                    <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.author)}&background=0f3d52&color=fff`;
                        }}
                    />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-primary-deep leading-none flex items-center gap-1.5 truncate">
                        {testimonial.author}
                        <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                        Paciente Verificado
                    </p>
                </div>
            </figcaption>
        </figure>
    );
};

export default function DepoimentsHome() {
    const googleMapsUrl = "https://share.google/jo6beS4GzDKh9nSuG";

    return (
        <section id="depoimentos" className="py-16 md:py-24 bg-[#f4f7f8] overflow-hidden">
            <div className="mx-auto max-w-[1050px] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="max-w-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Depoimentos
                        </span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-primary-deep">
                            Quem confia, sorri mais
                        </h2>
                        <p className="mt-3 text-muted-foreground text-sm">
                            Confira o que nossos pacientes dizem sobre sua experiência na Uteich Odontologia. Estas são algumas de nossas avaliações recentes no Google.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <PremiumStar key={i} />
                                ))}
                            </div>
                            <span className="font-bold text-foreground">4.9/5</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            Baseado em 45+ avaliações no Google
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-12 relative px-0 md:px-12"
                >
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-6">
                            {testimonials.map((testimonial) => (
                                <CarouselItem
                                    key={testimonial.id}
                                    className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
                                >
                                    <TestimonialCard testimonial={testimonial} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:inline-flex" />
                        <CarouselNext className="hidden md:inline-flex" />
                    </Carousel>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-none border border-primary/30 text-primary-deep hover:bg-primary-deep hover:text-white h-11 px-6 text-xs font-bold uppercase tracking-wider transition-colors w-full sm:w-auto text-center"
                    >
                        Ver todas as avaliações
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </a>
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-none bg-primary text-primary-foreground hover:bg-primary-deep h-11 px-6 text-xs font-bold uppercase tracking-wider shadow-none transition-colors w-full sm:w-auto text-center"
                    >
                        Avaliar no Google
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}