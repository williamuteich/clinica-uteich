"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { ServiceType } from "@/src/types/home/services";

const EmergênciaIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" strokeWidth={2} />
        <path d="M12 12l2.5-2.5" />
    </svg>
);

const AvaliacaoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="5" />
        <path d="M13.5 13.5L20 20" />
        <path d="M8 8a2 2 0 0 1 2-2" />
        <path d="M16 7l2 2 4-4" strokeWidth={2} className="text-cyan-500" />
    </svg>
);

const ClinicoGeralIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5a2 2 0 0 0-2 2v3a7 7 0 0 0 14 0V7a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v3a2 2 0 0 1-4 0V7a2 2 0 0 0-2-2H4z" />
        <path d="M16 10c0 4 3 6 3 6s3-2 3-6" />
        <circle cx="19" cy="18" r="2" />
    </svg>
);

const ImplanteIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5c1-1 3-1 4 0l2 1 2-1c1-1 3-1 4 0v4c0 3-1.5 5-4 5H10C7.5 14 6 12 6 9V5z" fill="currentColor" fillOpacity={0.1} />
        <path d="M12 14v6" strokeWidth={2} />
        <path d="M10 16h4M10 18h4" />
        <path d="M8 21h8" strokeWidth={1.5} />
    </svg>
);

const OrtodontiaIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6c0-2 2-2 3-2s3 1 4 3v5c0 3-1.5 5-3.5 5S4 15 4 12V6z" />
        <path d="M13 7c1-2 3-2 4-2s3 1 3 3v4c0 3-1.5 5-3.5 5s-3.5-2-3.5-5V7z" />
        <rect x="6.5" y="9" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity={0.2} />
        <rect x="14.5" y="9" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity={0.2} />
        <path d="M2 10.5h20" strokeWidth={2} className="text-teal-500" />
    </svg>
);

const CanalIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5c1-1 3-1 4 0l2 1 2-1c1-1 3-1 4 0v4c0 2.5-1.5 4.5-3.5 6l-0.5 4.5c0 .5-.5 1-1 1s-1-.5-1-1v-4.5c-2.5 0-4 1.5-4 4v0c0 .5-.5 1-1 1s-1-.5-1-1v-5c-2.5-1.5-3-3.5-3-6V5z" />
        <path d="M12 8v5" className="text-emerald-500" strokeWidth={1.5} />
        <path d="M12 13c.5.5.5 1.5.5 2.5" className="text-emerald-500" />
        <path d="M12 13c-.5.5-.5 1.5-.5 2.5" className="text-emerald-500" />
    </svg>
);

const EsteticaIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6c1-1 3-1 4 0l2 1 2-1c1-1 3-1 4 0v4c0 3-1.5 5.5-3.5 7l-0.5 3c0 .5-.5.5-1 .5s-1 0-1-.5l-0.5-3c-2-1.5-3.5-4-3.5-7V6z" fill="currentColor" fillOpacity={0.1} />
        <path d="M19 3l1 2.5L22.5 6 20 7l-1 2.5L18 7l-2.5-1 2.5-1z" fill="currentColor" className="text-amber-500" stroke="none" />
        <path d="M4 11l0.8 2 2 .8-2 0.8-0.8 2-0.8-2-2-.8 2-0.8z" fill="currentColor" className="text-amber-500" stroke="none" />
    </svg>
);

const ExtracaoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6c1-1 3-1 4 0l2 1 2-1c1-1 3-1 4 0v4c0 3-1.5 5.5-3.5 7l-0.5 3c0 .5-.5.5-1 .5s-1 0-1-.5l-0.5-3c-2-1.5-3.5-4-3.5-7V6z" />
        <path d="M12 6a4 4 0 0 1 4 4" strokeWidth={2.5} className="text-violet-500" />
        <circle cx="16" cy="7" r="0.75" fill="currentColor" />
    </svg>
);

const services: ServiceType[] = [
    {
        id: "emergencia",
        icon: "AlertCircle",
        name: "Emergência 24h",
        duration: 30,
        description: "Atendimento de emergência odontológica disponível a qualquer hora do dia ou da noite.",
        whatsappMessage: "Olá! Preciso de um atendimento de emergência odontológica."
    },
    {
        id: "avaliacao",
        icon: "ClipboardCheck",
        name: "Avaliação Gratuita",
        duration: 30,
        description: "Consulta inicial completa para avaliar sua saúde bucal e criar um plano de tratamento personalizado.",
        whatsappMessage: "Olá! Gostaria de agendar uma Avaliação Gratuita."
    },
    {
        id: "clinico-geral",
        icon: "Stethoscope",
        name: "Clínico Geral",
        duration: 45,
        description: "Tratamentos preventivos e curativos para manter sua saúde bucal em dia.",
        whatsappMessage: "Olá! Gostaria de agendar uma consulta com Clínico Geral."
    },
    {
        id: "protese-implante",
        icon: "Crown",
        name: "Prótese e Implante",
        duration: 60,
        description: "Reabilitação oral com próteses e implantes de alta qualidade para devolver seu sorriso.",
        whatsappMessage: "Olá! Gostaria de saber mais sobre Prótese e Implante."
    },
    {
        id: "ortodontia",
        icon: "Target",
        name: "Aparelho Ortodôntico",
        duration: 45,
        description: "Correção do alinhamento dental com aparelhos modernos e eficientes.",
        whatsappMessage: "Olá! Gostaria de saber mais sobre Aparelho Ortodôntico."
    },
    {
        id: "canal",
        icon: "Smile",
        name: "Tratamento de Canal",
        duration: 90,
        description: "Tratamento endodôntico para salvar dentes comprometidos e eliminar dores.",
        whatsappMessage: "Olá! Gostaria de agendar um Tratamento de Canal."
    },
    {
        id: "estetica",
        icon: "Sparkles",
        name: "Estética e Clareamento",
        duration: 60,
        description: "Procedimentos estéticos para um sorriso mais branco e harmonioso.",
        whatsappMessage: "Olá! Gostaria de saber mais sobre Estética e Clareamento."
    },
    {
        id: "extracao",
        icon: "Wrench",
        name: "Extração e Restauração",
        duration: 45,
        description: "Procedimentos cirúrgicos e restaurações dentárias com técnicas modernas.",
        whatsappMessage: "Olá! Gostaria de saber mais sobre Extração e Restauração."
    }
];

export function ServicesHome() {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        AlertCircle: EmergênciaIcon,
        ClipboardCheck: AvaliacaoIcon,
        Stethoscope: ClinicoGeralIcon,
        Crown: ImplanteIcon,
        Smile: CanalIcon,
        Target: OrtodontiaIcon,
        Sparkles: EsteticaIcon,
        Wrench: ExtracaoIcon,
    };

    const accentMap: Record<string, {
        bar: string;
        chip: string;
        badge: string;
        title: string;
        ring: string;
    }> = {
        emergencia: {
            bar: "bg-red-500",
            chip: "bg-red-500 text-white",
            badge: "bg-red-50 text-red-700",
            title: "text-red-700",
            ring: "group-hover:border-red-300",
        },
        avaliacao: {
            bar: "bg-cyan-500",
            chip: "bg-cyan-500 text-white",
            badge: "bg-cyan-50 text-cyan-700",
            title: "text-primary-deep",
            ring: "group-hover:border-cyan-300",
        },
        "clinico-geral": {
            bar: "bg-sky-500",
            chip: "bg-sky-500 text-white",
            badge: "bg-sky-50 text-sky-700",
            title: "text-primary-deep",
            ring: "group-hover:border-sky-300",
        },
        "protese-implante": {
            bar: "bg-indigo-500",
            chip: "bg-indigo-500 text-white",
            badge: "bg-indigo-50 text-indigo-700",
            title: "text-primary-deep",
            ring: "group-hover:border-indigo-300",
        },
        ortodontia: {
            bar: "bg-teal-500",
            chip: "bg-teal-500 text-white",
            badge: "bg-teal-50 text-teal-700",
            title: "text-primary-deep",
            ring: "group-hover:border-teal-300",
        },
        canal: {
            bar: "bg-emerald-500",
            chip: "bg-emerald-500 text-white",
            badge: "bg-emerald-50 text-emerald-700",
            title: "text-primary-deep",
            ring: "group-hover:border-emerald-300",
        },
        estetica: {
            bar: "bg-amber-500",
            chip: "bg-amber-500 text-white",
            badge: "bg-amber-50 text-amber-700",
            title: "text-primary-deep",
            ring: "group-hover:border-amber-300",
        },
        extracao: {
            bar: "bg-violet-500",
            chip: "bg-violet-500 text-white",
            badge: "bg-violet-50 text-violet-700",
            title: "text-primary-deep",
            ring: "group-hover:border-violet-300",
        },
    };

    const getWhatsAppLink = (message: string) => {
        return `https://api.whatsapp.com/send/?phone=5551991581059&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <section id="servicos" className="py-16 md:py-24 bg-[#f4f7f8]">
            <div className="mx-auto max-w-[1050px] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl"
                >
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Nossos serviços</span>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-primary-deep">
                        Cuidado completo para toda a família
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        7+ especialidades sob o mesmo teto, com tecnologia moderna e profissionais qualificados.
                    </p>
                </motion.div>

                <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-20px" }}
                    className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service: ServiceType) => {
                        const Icon = iconMap[service.icon] || ClinicoGeralIcon;
                        const isEmergency = service.id === 'emergencia';
                        const accent = accentMap[service.id] || accentMap.avaliacao;

                        const cardContent = (
                            <div className="flex h-full flex-col">
                                <div className={`h-1 w-full ${accent.bar}`} />
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className={`h-12 w-12 grid place-items-center rounded-none ${isEmergency
                                            ? 'bg-red-500 text-white'
                                            : accent.chip
                                            }`}>
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-none ${isEmergency ? 'bg-red-50 text-red-700' : accent.badge}`}>
                                            Aprox. {service.duration} min
                                        </span>
                                    </div>
                                    <h3 className={`mt-4 text-lg font-semibold leading-tight ${isEmergency ? 'text-red-700' : accent.title}`}>
                                        {service.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        {service.description}
                                    </p>
                                    {isEmergency && (
                                        <div className="mt-auto pt-5">
                                            <div className="pt-4 border-t border-border/70 flex items-center justify-between text-sm font-semibold text-red-600">
                                                <span>Ligar agora</span>
                                                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );

                        if (isEmergency) {
                            return (
                                <motion.li
                                    variants={itemVariants}
                                    key={service.id}
                                    className="h-full transform-gpu"
                                >
                                    <a
                                        href="tel:5551991581059"
                                        className={`group relative overflow-hidden bg-white h-full rounded-none shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer block border border-border/70 ${accent.ring}`}
                                    >
                                        {cardContent}
                                    </a>
                                </motion.li>
                            );
                        }

                        return (
                            <motion.li
                                variants={itemVariants}
                                key={service.id}
                                className="h-full transform-gpu"
                            >
                                <div
                                    className="relative overflow-hidden bg-white h-full rounded-none shadow-sm border border-border/70"
                                >
                                    {cardContent}
                                </div>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </div>
        </section>
    );
}