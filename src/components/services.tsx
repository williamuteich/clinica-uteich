import { services, clinicInfo } from "@/data/services";
import { AlertCircle, ChevronRight, ClipboardCheck, Crown, Smile, Sparkles, Stethoscope, Target, Wrench } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Services() {

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        AlertCircle,
        ClipboardCheck,
        Stethoscope,
        Crown,
        Smile,
        Target,
        Sparkles,
        Wrench,
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
                staggerChildren: 0.08 // Slightly faster stagger
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 }, // Reduced Y distance
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" } // Faster duration
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
                    {services.map((service) => {
                        const Icon = iconMap[service.icon] || Stethoscope;
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
                                            <Icon className="h-5 w-5" />
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
                                    <div className={`mt-5 pt-4 border-t border-border/70 flex items-center justify-between text-sm font-semibold ${isEmergency ? 'text-red-600' : 'text-primary'}`}>
                                        <span>{isEmergency ? 'Ligar agora' : 'Agendar pelo WhatsApp'}</span>
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        );

                        return (
                            <motion.li 
                                variants={itemVariants}
                                key={service.id}
                                className="h-full transform-gpu" // Added transform-gpu
                            >
                                <a
                                    href={isEmergency ? `tel:+55${clinicInfo.emergencyPhone}` : getWhatsAppLink(service.whatsappMessage || "")}
                                    target={isEmergency ? undefined : "_blank"}
                                    rel={isEmergency ? undefined : "noopener noreferrer"}
                                    className={`group relative overflow-hidden bg-white h-full rounded-none shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer block border border-border/70 ${accent.ring}`}
                                >
                                    {cardContent}
                                </a>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </div>
        </section>
    )
}