import { Check } from "lucide-react";

export default function About() {
    const features = [
        "Equipamentos digitais de última geração",
        "Ambiente seguro e protocolos rigorosos",
        "Atendimento personalizado e sem dor",
        "Planos flexíveis e parcelamento facilitado",
    ];

    return (
        <section id="sobre" className="py-16 md:py-24">
            <div className="mx-auto max-w-[1050px] px-4 grid gap-10 md:grid-cols-2 md:items-center">
                <div className="order-2 md:order-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Sobre a clínica
                    </span>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-primary-deep">
                        Uma clínica pensada para o seu conforto
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Há mais de uma década cuidando de sorrisos com excelência técnica e olhar humano. Nosso compromisso é entregar resultados naturais, seguros e duradouros.
                    </p>
                    <ul className="mt-6 space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="mt-0.5 h-5 w-5 grid place-items-center bg-primary text-primary-foreground rounded-none shrink-0">
                                    <Check className="h-3 w-3" />
                                </span>
                                <span className="text-sm text-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="order-1 md:order-2">
                    <img
                        src="/assets/clinic.jpg"
                        alt="Interior da clínica Uteich Odontologia"
                        width={1280}
                        height={896}
                        loading="lazy"
                        className="w-full h-auto rounded-none border border-border object-cover aspect-[4/3]"
                    />
                </div>
            </div>
        </section>
    );
}