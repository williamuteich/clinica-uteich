import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { clinicInfo } from "@/data/services";

export default function CardAgenda() {
    const contactItems = [
        {
            icon: MapPin,
            label: "Endereço",
            value: clinicInfo.address,
        },
        {
            icon: Phone,
            label: "Telefone",
            value: clinicInfo.whatsappFormatted,
            href: `tel:+55${clinicInfo.emergencyPhone}`,
        },
        {
            icon: Mail,
            label: "E-mail",
            value: clinicInfo.email,
            href: `mailto:${clinicInfo.email}`,
        },
        {
            icon: Clock,
            label: "Horário",
            value: clinicInfo.hours,
        },
    ];

    return (
        <section id="contato" className="py-16 md:py-24">
            <div className="mx-auto max-w-[1050px] px-4">
                <div className="bg-primary-deep text-primary-foreground p-6 md:p-12 rounded-none relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]"></div>

                    <div className="relative grid gap-10 md:grid-cols-2">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                                Agende agora
                            </span>
                            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
                                Pronto para transformar seu sorriso?
                            </h2>
                            <p className="mt-3 text-white/80 max-w-md">
                                Avaliação gratuita e sem compromisso. Responda em minutos pelo WhatsApp.
                            </p>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <a
                                    href={`https://wa.me/55${clinicInfo.whatsapp}`}
                                    className="inline-flex items-center justify-center gap-2 bg-white text-primary-deep px-5 py-3.5 text-sm font-semibold rounded-none hover:bg-white/90 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar h-4 w-4">
                                        <path d="M8 2v4"></path>
                                        <path d="M16 2v4"></path>
                                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                        <path d="M3 10h18"></path>
                                    </svg>
                                    Agendar pelo WhatsApp
                                </a>
                                <a
                                    href={`tel:+55${clinicInfo.emergencyPhone}`}
                                    className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-5 py-3.5 text-sm font-semibold rounded-none hover:bg-white/10 transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    Ligar agora
                                </a>
                            </div>
                        </div>

                        <ul className="space-y-4 text-sm">
                            {contactItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <li key={index} className="flex items-start gap-3 border-b border-white/10 pb-4 last:border-0">
                                        <span className="h-9 w-9 grid place-items-center bg-white/10 rounded-none shrink-0">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-white/60">
                                                {item.label}
                                            </p>
                                            <p className="mt-0.5 text-white">
                                                {item.href ? (
                                                    <a href={item.href} className="hover:text-white/80 transition-colors">
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    item.value
                                                )}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}