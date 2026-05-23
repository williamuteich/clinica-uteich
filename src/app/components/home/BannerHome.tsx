"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, CheckCircle, Stethoscope, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const heroImage = "/banner/hero-dental.jpg";

export default function BannerHome() {
    return (
        <section id="inicio" className="relative overflow-hidden bg-primary-deep">
            <div className="absolute inset-0 opacity-[0.11]" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px"
            }}></div>
            <div className="relative mx-auto max-w-[1050px] px-4 pt-10 pb-12 md:pt-20 md:pb-24 md:grid md:grid-cols-2 md:gap-10 md:items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-primary-foreground"
                >
                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-2 py-[1.5px] text-xs font-medium rounded-none border border-white/20">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        CRO 32301 · Excelência e Confiança
                    </span>
                    <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight">
                        Seu sorriso<br />merece o<br />
                        <span className="text-primary-soft">melhor cuidado.</span>
                    </h1>
                    <p className="mt-5 text-base md:text-base text-white/85 max-w-md">
                        Tecnologia avançada and cuidado especializado para transformar seu sorriso. Agende sua avaliação gratuita e sem compromisso.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/agendar"
                            className="inline-flex items-center justify-center gap-2 bg-white text-[#0f3d52] px-3 py-3.5 text-xs font-semibold rounded-none hover:bg-white/90 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                            Agendar consulta
                        </Link>
                        <a
                            href="tel:5551991581059"
                            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-3 py-3.5 text-xs font-semibold rounded-none hover:bg-white/10 transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            Emergência 24h
                        </a>
                    </div>
                    <ul className="mt-4 grid gap-3 max-w-md border-t border-white/15 pt-6">
                        {[
                            { icon: CheckCircle, title: "Avaliação gratuita", desc: "Diagnóstico completo sem compromisso" },
                            { icon: Stethoscope, title: "Tecnologia digital", desc: "Scanner intraoral e raio-x de baixa radiação" },
                            { icon: ShieldCheck, title: "Condições facilitadas", desc: "Opções de parcelamento em todos os tratamentos" }
                        ].map((item, i) => (
                            <motion.li
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 + (i * 0.1) }}
                                key={i}
                                className="flex items-start gap-3"
                            >
                                <span className="mt-0.5 grid place-items-center h-8 w-8 shrink-0 bg-white/10 border border-white/20 rounded-none">
                                    <item.icon className="h-4 w-4 text-[#7ecde8]" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">{item.title}</p>
                                    <p className="text-xs text-white/70 mt-0.5">{item.desc}</p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-10 md:mt-0 relative"
                >
                    <div className="relative bg-white/95 p-3 rounded-none shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)]">
                        <Image
                            src={heroImage}
                            alt="Dr. Lenon Uteich"
                            width={400}
                            height={500}
                            className="w-full h-auto rounded-none object-cover aspect-4/5"
                            style={{ objectPosition: "center 30%", width: "100%", height: "auto" }}
                            priority
                        />
                        <div className="absolute -bottom-3 left-3 right-3 bg-[#0f3d52] text-white px-4 py-3 rounded-none flex items-center gap-3">
                            <div className="h-9 w-9 grid place-items-center bg-white/15 rounded-none text-xs font-bold">
                                DR
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">Dr. Lenon Uteich</p>
                                <p className="text-[11px] text-white/70">CRO 32301 · Cirurgião-Dentista</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}