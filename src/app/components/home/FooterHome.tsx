import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

export function FooterHome() {
    return (
        <footer className="bg-primary-deep text-primary-foreground pt-10 pb-32 md:pb-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[18px_18px]" />

            <div className="mx-auto max-w-[1050px] px-4">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-4 md:gap-0">
                        <Link href="/" className="flex shrink-0 items-center gap-2 mb-5">
                            <img
                                src="/logoFooter.png"
                                alt="Uteich Odontologia"
                                className="h-14 w-auto object-contain"
                            />
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-primary-foreground/70 bg-white/5 px-3 py-1.5 rounded-full">
                            <Clock className="w-3 h-3 text-primary-soft shrink-0" />
                            <span>Seg-Sex: 8h-20h | Sáb: 9h-18h</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-5">
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40 font-bold">Redes Sociais</span>
                            <div className="flex gap-2.5">
                                <a
                                    href="https://www.instagram.com/uteichodontologia/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
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
                                        className="lucide lucide-instagram w-3.5 h-3.5"
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
                                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
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
                                        className="lucide lucide-facebook w-3.5 h-3.5"
                                    >
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                </a>
                                <a
                                    href="https://api.whatsapp.com/send/?phone=5551991581059&text=Ol%C3%A1%21+Gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+os+servi%C3%A7os+da+Uteich+Odontologia.&type=phone_number&app_absent=0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
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
                        <div className="flex flex-col items-center md:items-end gap-1">
                            <p className="text-[10px] text-primary-foreground/60 font-medium tracking-wider uppercase">Dr. Lenon Uteich</p>
                            <p className="text-[9px] text-primary-foreground/30 uppercase tracking-[0.2em]">CRO 32301</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-primary-foreground/40 uppercase tracking-widest font-medium">
                    <p>© 2026 Uteich Odontologia.</p>
                    <div className="flex gap-4">
                        <p>Todos os direitos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
