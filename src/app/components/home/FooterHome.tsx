import Link from "next/link";
import { Clock, MapPin, Phone, Mail, FileText, Shield } from "lucide-react";

export function FooterHome() {
    return (
        <footer className="bg-[#092635] text-white pt-16 pb-32 md:pb-16 relative overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]" />

            <div className="mx-auto max-w-[1050px] px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">

                    <div className="md:col-span-4 flex flex-col gap-4">
                        <Link href="/" className="flex shrink-0 items-center gap-2">
                            <img
                                src="/logoFooter.png"
                                alt="Uteich Odontologia"
                                className="h-12 w-auto object-contain brightness-100"
                            />
                        </Link>
                        <p className="text-xs text-white/50 leading-relaxed font-light mt-2">
                            Cuidado especializado e tecnologia de ponta para transformar a sua saúde bucal. Excelência em tratamentos odontológicos em Cachoeirinha - RS.
                        </p>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-dental-sky">Navegação</h4>
                        <ul className="flex flex-col gap-2.5 text-xs text-white/60 font-light">
                            <li>
                                <Link href="/#inicio" className="hover:text-dental-light transition-colors">Início</Link>
                            </li>
                            <li>
                                <Link href="/#servicos" className="hover:text-dental-light transition-colors">Serviços</Link>
                            </li>
                            <li>
                                <Link href="/#sobre" className="hover:text-dental-light transition-colors">Sobre</Link>
                            </li>
                            <li>
                                <Link href="/#depoimentos" className="hover:text-dental-light transition-colors">Depoimentos</Link>
                            </li>
                            <li>
                                <Link href="/#contato" className="hover:text-dental-light transition-colors">Contato</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-dental-sky">Transparência</h4>
                        <ul className="flex flex-col gap-2.5 text-xs text-white/60 font-light">
                            <li className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-dental-light/60 shrink-0" />
                                <Link href="/politica-de-privacidade" className="hover:text-dental-light transition-colors">Política de Privacidade</Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-dental-light/60 shrink-0" />
                                <Link href="/termos-de-uso" className="hover:text-dental-light transition-colors">Termos de Uso</Link>
                            </li>
                        </ul>
                        <div className="mt-2 p-3 bg-white/3 border border-white/5 text-[9px] text-white/40 leading-relaxed font-light rounded-none">
                            Nossos canais digitais operam em conformidade com a LGPD (Lei 13.709/18). Os dados informados no agendamento são confidenciais.
                        </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-dental-sky">Contato</h4>
                        <ul className="flex flex-col gap-2.5 text-xs text-white/60 font-light">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-dental-light shrink-0 mt-0.5" />
                                <span>Rua Papa João XXIII, 80 – Vila Cachoeirinha, RS</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-dental-light shrink-0" />
                                <a href="tel:5551991581059" className="hover:text-dental-light transition-colors">(51) 99158-1059</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-dental-light shrink-0" />
                                <a href="mailto:uteichodontologia@gmail.com" className="hover:text-dental-light transition-colors">uteichodontologia@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-dental-light shrink-0" />
                                <span>Seg-Sex: 8h-20h | Sáb: 9h-18h</span>
                            </li>
                        </ul>

                        <div className="flex gap-2.5 mt-2">
                            <a
                                href="https://www.instagram.com/uteichodontologia/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-none border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-dental-light/40 transition-all hover:scale-105"
                                aria-label="Instagram"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3.5 h-3.5"
                                >
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/people/Uteich-Odontologia/61582793833076/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-none border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-dental-light/40 transition-all hover:scale-105"
                                aria-label="Facebook"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3.5 h-3.5"
                                >
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a
                                href="https://api.whatsapp.com/send/?phone=5551991581059&text=Ol%C3%A1%21+Gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+os+servi%C3%A7os+da+Uteich+Odontologia.&type=phone_number&app_absent=0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-none border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-dental-light/40 transition-all hover:scale-105"
                                aria-label="WhatsApp"
                            >
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 448 512"
                                    className="w-3.5 h-3.5"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-white/40 uppercase tracking-[0.2em] font-medium">
                    <p>© 2026 Uteich Odontologia. Todos os direitos reservados.</p>
                    <p className="flex items-center gap-1">
                        Desenvolvido com excelência
                    </p>
                </div>
            </div>
        </footer>
    );
}
