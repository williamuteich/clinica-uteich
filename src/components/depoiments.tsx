import { Star } from "lucide-react";

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

export default function Depoiments() {
    return (
        <section className="py-16 md:py-24 bg-[#f4f7f8]">
            <div className="mx-auto max-w-[1050px] px-4">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Depoimentos
                        </span>
                        <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-primary-deep">
                            Quem confia, sorri mais
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="h-4 w-4 fill-primary text-primary"
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                        <span className="font-medium text-foreground text-xs">4.9/5</span> · 45+ avaliações
                    </div>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <figure
                            key={testimonial.id}
                            className="bg-card border border-border p-6 rounded-none"
                        >
                            <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-3 w-3 fill-primary text-primary"
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                            <blockquote className="mt-4 text-xs text-foreground leading-relaxed">
                                "{testimonial.text}"
                            </blockquote>
                            <figcaption className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                                <div className="h-9 w-9 grid place-items-center bg-primary/10 text-primary text-xs font-bold rounded-none">
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-primary-deep">
                                        {testimonial.author}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {testimonial.service}
                                    </p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}