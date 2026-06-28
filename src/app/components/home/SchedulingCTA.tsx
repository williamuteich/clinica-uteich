"use client";

import { SchedulingWizard } from "./SchedulingWizard";
import { motion } from "framer-motion";

export function SchedulingCTA() {
    return (
        <section id="agendamento" className="py-16 md:py-24 bg-linear-to-b from-[#eef5f7] to-[#f4f7f8] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)",
                backgroundSize: "24px 24px"
            }} />

            <div className="mx-auto max-w-[1050px] px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Agendamento Simplificado</span>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-primary-deep">
                        Agende sua consulta ou procedimento
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Escolha o dia e horário de sua preferência. É rápido, prático e seguro. 
                        Qualquer agendamento inicia como uma <strong className="font-semibold text-primary-deep">Avaliação Inicial 100% Gratuita e Sem Compromisso</strong>.
                    </p>
                </motion.div>

                <SchedulingWizard />
            </div>
        </section>
    );
}
