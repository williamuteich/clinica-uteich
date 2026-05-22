"use client"

import { Check } from "lucide-react";
import { motion } from "framer-motion";
export function AboutHome() {
    const features = [
        "Equipamentos digitais de última geração",
        "Ambiente seguro e protocolos rigorosos",
        "Atendimento personalizado e sem dor",
        "Planos flexíveis e parcelamento facilitado",
    ];
    return (
        <section id="sobre" className="py-16 md:py-24 overflow-hidden">
            <div className="mx-auto max-w-[1050px] px-4 grid gap-10 md:grid-cols-2 md:items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="order-2 md:order-1"
                >
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Sobre a clínica
                    </span>
                    <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-primary-deep">
                        Uma clínica pensada para o seu conforto
                    </h2>
                    <p className="mt-4 text-muted-foreground text-sm">
                        Tecnologia de ponta e cuidado especializado para transformar o seu sorriso. Nosso compromisso é entregar resultados naturais, seguros e duradouros com o máximo de conforto.
                    </p>
                    <ul className="mt-6 space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="mt-0.5 h-4 w-4 grid place-items-center bg-primary text-primary-foreground rounded-none shrink-0">
                                    <Check className="h-3 w-3" />
                                </span>
                                <span className="text-xs text-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="order-1 md:order-2"
                >
                    <img
                        src="/assets/clinic.jpg"
                        alt="Interior da clínica Uteich Odontologia"
                        width={1280}
                        height={896}
                        loading="lazy"
                        className="w-full h-auto rounded-none border border-border object-cover aspect-4/3"
                    />
                </motion.div>
            </div>
        </section>
    )
}