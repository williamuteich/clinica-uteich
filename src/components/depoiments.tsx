import { MessageSquare, ArrowRight, ExternalLink, BadgeCheck } from "lucide-react";
import { Button } from "./ui/button";

const testimonials = [
    {
        id: 1,
        text: "Atendimento incrível, sem dor e com resultado lindo. Recomendo de olhos fechados!",
        author: "Marina S.",
        service: "Clareamento",
        initials: "MS",
        rating: 5,
    },
    {
        id: 2,
        text: "Coloquei meu implante e o processo foi muito tranquilo. Equipe nota 10.",
        author: "Rafael P.",
        service: "Implante",
        initials: "RP",
        rating: 5,
    },
    {
        id: 3,
        text: "Levei meu filho e ele amou. Profissionais carinhosos e ambiente acolhedor.",
        author: "Camila R.",
        service: "Odontopediatria",
        initials: "CR",
        rating: 5,
    },
];

// Custom Premium Star Icon
const PremiumStar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export default function Depoiments() {
    const googleMapsUrl = "https://share.google/jo6beS4GzDKh9nSuG";

    return (
        <section id="depoimentos" className="py-16 md:py-24 bg-[#f4f7f8]">
            <div className="mx-auto max-w-[1050px] px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Depoimentos
                        </span>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-primary-deep">
                            Quem confia, sorri mais
                        </h2>
                        <p className="mt-3 text-muted-foreground text-sm">
                            Confira o que nossos pacientes dizem sobre sua experiência na Uteich Odontologia. Estas são algumas de nossas avaliações recentes.
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
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <figure
                            key={testimonial.id}
                            className="bg-white border border-border/50 p-7 rounded-none shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            <div className="flex gap-0.5">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <PremiumStar key={i} />
                                ))}
                            </div>
                            <blockquote className="mt-5 text-sm text-foreground/80 leading-relaxed italic">
                                "{testimonial.text}"
                            </blockquote>
                            <figcaption className="mt-6 pt-5 border-t border-border/40 flex items-center gap-3">
                                <div className="h-10 w-10 grid place-items-center bg-primary/5 text-primary text-xs font-extrabold rounded-none border border-primary/10">
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary-deep leading-none flex items-center gap-1.5">
                                        {testimonial.author}
                                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                                        {testimonial.service}
                                    </p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild variant="outline" className="rounded-none border-primary/30 text-primary-deep hover:bg-primary-deep hover:text-white h-11 px-6 text-xs font-bold uppercase tracking-wider transition-colors">
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                            Ver todas as avaliações
                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </a>
                    </Button>
                    <Button asChild className="rounded-none bg-primary text-primary-foreground hover:bg-primary-deep h-11 px-6 text-xs font-bold uppercase tracking-wider shadow-none transition-colors">
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                            Avaliar no Google
                            <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}