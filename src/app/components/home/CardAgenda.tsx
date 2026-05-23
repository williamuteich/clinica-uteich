import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";

export function CardAgendaHome() {
    const contactItems = [
        {
            icon: MapPin,
            label: "Endereço",
            value: "Rua Papa João XXIII, 80 – Vila Cachoeirinha – Cachoeirinha – RS",
        },
        {
            icon: Phone,
            label: "Telefone",
            value: "(51) 99158-1059",
            href: "tel:5551991581059",
        },
        {
            icon: Mail,
            label: "E-mail",
            value: "uteichodontologia@gmail.com",
            href: "mailto:uteichodontologia@gmail.com",
        },
        {
            icon: Clock,
            label: "Horário",
            value: "Seg-Sex: 8h-20h | Sáb: 9h-18h",
        },
    ];

    return (
        <section id="contato" className="py-16 md:py-24">
            <div className="mx-auto max-w-[1150px] px-4">
                <div className="relative overflow-hidden bg-primary-deep p-6 md:p-10">
                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]" />

                    <div className="relative mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-xl">
                            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                                Localização
                            </span>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                                Venha conhecer a Uteich Odontologia
                            </h2>

                            <p className="mt-4 text-sm leading-relaxed text-white/70">
                                Atendimento especializado em um ambiente moderno,
                                confortável e pensado para cuidar do seu sorriso.
                            </p>
                        </div>

                        <a
                            href="https://www.google.com/maps/dir/?api=1&destination=Uteich+Odontologia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-12 items-center justify-center gap-2 border border-white/15 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-primary-deep"
                        >
                            Como chegar
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="relative grid overflow-hidden border border-white/10 bg-white/3 md:grid-cols-[1.4fr_0.9fr]">
                        <div className="min-h-[420px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3457.0406543085846!2d-51.097172723560654!3d-29.949509226882245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95197307aedae6af%3A0xd7c6f77e6df6978f!2sUteich%20Odontologia!5e0!3m2!1spt-BR!2sbr!4v1779557312063!5m2!1spt-BR!2sbr"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="h-full w-full"
                            />
                        </div>

                        <div className="flex flex-col justify-center p-6 md:p-8">
                            <div className="space-y-4">
                                {contactItems.map((item, index) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-white/5">
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                                                    {item.label}
                                                </p>

                                                {item.href ? (
                                                    <a
                                                        href={item.href}
                                                        className="mt-1 block text-sm leading-relaxed text-white transition-colors hover:text-white/70"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1 text-sm leading-relaxed text-white">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}