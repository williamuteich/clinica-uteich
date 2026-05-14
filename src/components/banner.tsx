import { clinicInfo } from "@/data/services";
import { Link } from "react-router-dom";
import { Phone, Sparkles, Stethoscope } from "lucide-react";
import heroImage from "@/assets/hero-dental.jpg";

export default function Banner() {
    return (
        <section id="inicio" className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a5f7f 0%, #1a92c1 50%, #07aee5 100%)" }}>
            <div className="absolute inset-0 opacity-[0.07]" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px"
            }}></div>
            <div className="relative mx-auto max-w-5xl px-4 pt-10 pb-12 md:pt-20 md:pb-24 md:grid md:grid-cols-2 md:gap-10 md:items-center">
                <div className="text-primary-foreground">
                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium rounded-none border border-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                        CRO {clinicInfo.cro} · Atendimento humanizado
                    </span>
                    <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                        Seu sorriso<br />merece o<br />
                        <span className="text-[#7ecde8]">melhor cuidado.</span>
                    </h1>
                    <p className="mt-5 text-base md:text-lg text-white/85 max-w-md">
                        Tecnologia de ponta e atendimento humanizado para transformar seu sorriso. Agende sua avaliação gratuita.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/agendamento"
                            className="inline-flex items-center justify-center gap-2 bg-white text-[#0f3d52] px-5 py-3.5 text-sm font-semibold rounded-none hover:bg-white/90 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                            Agendar consulta
                        </Link>
                        <a
                            href={`tel:${clinicInfo.emergencyPhone.replace(/\D/g, '')}`}
                            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-5 py-3.5 text-sm font-semibold rounded-none hover:bg-white/10 transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            Emergência 24h
                        </a>
                    </div>
                    <ul className="mt-10 grid gap-3 max-w-md border-t border-white/15 pt-6">
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 grid place-items-center h-8 w-8 shrink-0 bg-white/10 border border-white/20 rounded-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#7ecde8]" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-white leading-tight">Avaliação gratuita</p>
                                <p className="text-xs text-white/70 mt-0.5">Diagnóstico completo sem compromisso</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 grid place-items-center h-8 w-8 shrink-0 bg-white/10 border border-white/20 rounded-none">
                                <Stethoscope className="h-4 w-4 text-[#7ecde8]" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-white leading-tight">Tecnologia digital</p>
                                <p className="text-xs text-white/70 mt-0.5">Scanner intraoral e raio-x de baixa radiação</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 grid place-items-center h-8 w-8 shrink-0 bg-white/10 border border-white/20 rounded-none">
                                <Sparkles className="h-4 w-4 text-[#7ecde8]" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-white leading-tight">Parcelamos em até 12x</p>
                                <p className="text-xs text-white/70 mt-0.5">Condições especiais em todos os tratamentos</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="mt-10 md:mt-0 relative">
                    <div className="relative bg-white/95 p-3 rounded-none shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)]">
                        <img
                            src={heroImage}
                            alt="Dr. Lenon Uteich"
                            className="w-full h-auto rounded-none object-cover aspect-[4/5]"
                            style={{ objectPosition: "center 30%" }}
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                        />
                        <div className="absolute -bottom-3 left-3 right-3 bg-[#0f3d52] text-white px-4 py-3 rounded-none flex items-center gap-3">
                            <div className="h-9 w-9 grid place-items-center bg-white/15 rounded-none text-xs font-bold">
                                DR
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">{clinicInfo.doctor}</p>
                                <p className="text-[11px] text-white/70">CRO {clinicInfo.cro} · Cirurgião-Dentista</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}