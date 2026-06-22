"use client";

import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const advantages = [
    {
        category: "Tecnologia",
        title: "Planejamento 3D Avançado",
        description: "Diagnóstico digital preciso e tratamentos rápidos com scanner intraoral de última geração.",
    },
    {
        category: "Corpo Clínico",
        title: "Especialistas Qualificados",
        description: "Equipe multidisciplinar em constante atualização para oferecer tratamentos seguros.",
    },
    {
        category: "Experiência",
        title: "Cuidado Humanizado & Conforto",
        description: "Ambiente moderno e acolhedor projetado para eliminar a ansiedade e garantir o seu bem-estar.",
    }
];

export default function BannerHome() {
    return (
        <section id="inicio" className="relative overflow-hidden bg-[#092635] py-16 md:py-28 text-white">
            <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px"
            }}></div>

            <svg className="absolute right-0 bottom-0 h-1/2 w-full opacity-10 text-dental-sky pointer-events-none hidden md:block" viewBox="0 0 1440 320" fill="none">
                <path d="M0,192 C240,245.3 480,298.7 720,298.7 C960,298.7 1200,245.3 1440,192" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                <path d="M0,128 C240,181.3 480,234.7 720,234.7 C960,234.7 1200,181.3 1440,128" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            </svg>

            <div className="relative mx-auto max-w-[1050px] px-4 md:grid md:grid-cols-12 md:gap-10 md:items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="md:col-span-7 flex flex-col justify-center"
                >

                    <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                        Seu sorriso <br />
                        <span className="bg-linear-to-r from-dental-sky via-dental-light to-white bg-clip-text text-transparent drop-shadow-sm">
                            merece o melhor.
                        </span>
                    </h1>

                    <p className="mt-5 text-sm md:text-base text-white/80 max-w-lg font-light leading-relaxed">
                        Tecnologia avançada e cuidado especializado para transformar seu sorriso. Agende sua avaliação gratuita e sem compromisso.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/agendar"
                            className="group relative inline-flex items-center justify-center gap-2 bg-linear-to-r from-dental-light to-dental-sky text-primary-deep px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-none overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(110,211,243,0.35)]"
                        >
                            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                            <span className="relative flex items-center gap-2">
                                Agendar consulta de avaliação
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>

                        <a
                            href="tel:5551991581059"
                            className="inline-flex items-center justify-center gap-2 border border-white/25 bg-white/5 backdrop-blur-sm text-white px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-none hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                        >
                            <Phone className="h-4 w-4 text-dental-sky" />
                            Emergência 24h
                        </a>
                    </div>

                    <div className="mt-12 flex flex-wrap items-center gap-x-2.5 sm:gap-x-5 gap-y-1 text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-semibold text-white/50 border-t border-white/10 pt-8 uppercase tracking-wider">
                        <span>Clínica Geral</span>
                        <span className="w-1 h-1 rounded-full bg-dental-light/60" />
                        <span>Implantes & Próteses</span>
                        <span className="w-1 h-1 rounded-full bg-dental-light/60" />
                        <span>Estética do Sorriso</span>
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15,
                                delayChildren: 0.2
                            }
                        }
                    }}
                    className="hidden md:flex md:col-span-5 flex-col gap-5 relative z-10"
                >
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                        }}
                        className="flex flex-col gap-1.5 mb-2"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-dental-sky">
                            Diferenciais Uteich
                        </span>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            Por que escolher a nossa clínica?
                        </h3>
                    </motion.div>

                    {advantages.map((item, index) => {
                        return (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, x: 30 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="group relative overflow-hidden border border-white/10 bg-white/3 p-5 transition-all duration-300 hover:bg-white/6 hover:border-dental-light/40 rounded-none shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md flex gap-4 items-start"
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-dental-sky/70 group-hover:text-dental-sky transition-colors duration-300 block mb-0.5">
                                        {item.category}
                                    </span>
                                    <h4 className="text-sm font-bold text-white leading-tight">
                                        {item.title}
                                    </h4>
                                    <p className="mt-1.5 text-xs text-white/60 group-hover:text-white/75 transition-colors duration-300 leading-relaxed font-light">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}