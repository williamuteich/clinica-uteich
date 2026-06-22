import { HeaderHome } from "../components/home/HeaderHome";
import { FooterHome } from "../components/home/FooterHome";
import { FileText } from "lucide-react";

export const metadata = {
    title: "Termos de Uso | Uteich Odontologia",
    description: "Termos de Uso do site e do sistema de agendamento online da Uteich Odontologia em Cachoeirinha - RS.",
};

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderHome />
            <main className="flex-1 max-w-[850px] mx-auto px-4 py-12 md:py-20 w-full">
                <div className="bg-white border border-slate-200 p-6 md:p-10 shadow-sm rounded-none">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
                        <FileText className="w-8 h-8 text-primary-deep" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                Termos de Uso
                            </h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                                Uteich Odontologia • Última atualização: Junho de 2026
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                        <p>
                            Seja bem-vindo ao portal da <strong>Uteich Odontologia</strong>. Ao utilizar nosso site de agendamento e canais de atendimento, você concorda em cumprir e aceitar os seguintes Termos de Uso. Caso não concorde com os termos apresentados, orientamos não prosseguir com a utilização deste canal.
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">1</span>
                                Finalidade do Canal
                            </h2>
                            <p>
                                Este site tem por finalidade apresentar as especialidades clínicas, estrutura da Uteich Odontologia e oferecer uma ferramenta facilitadora para pré-agendamento de consultas de avaliação inicial gratuita. 
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">2</span>
                                Agendamento e Responsabilidades
                            </h2>
                            <p>
                                Ao utilizar o formulário de agendamento online:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Você declara fornecer informações verídicas, exatas e atualizadas (Nome completo, telefone/WhatsApp ativo e detalhes da observação).</li>
                                <li>O pré-agendamento realizado pelo site não garante a reserva automática do horário. Nosso atendimento entrará em contato via ligação ou WhatsApp para validar as informações e confirmar oficialmente a data e horário da avaliação.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">3</span>
                                Uso do Painel Administrativo Interno
                            </h2>
                            <p>
                                O painel administrativo da Uteich Odontologia é de acesso restrito e exclusivo para dentistas e colaboradores internos devidamente credenciados da clínica. 
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Não é concedido acesso a pacientes ou terceiros externos a este painel administrativo.</li>
                                <li>Todos os dados sensíveis dos pacientes inseridos e gerenciados internamente (anamnese, CPF, procedimentos odontológicos, evolução clínica, dados de contato e de pagamento) são tratados sob absoluto sigilo profissional, respeitando o Código de Ética Odontológica e a legislação nacional.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">4</span>
                                Limitação de Responsabilidade
                            </h2>
                            <p>
                                A Uteich Odontologia não se responsabiliza por indisponibilidades temporárias no sistema de agendamento geradas por falhas técnicas do servidor ou de conexão com a internet. O canal oficial para agendamento alternativo permanece sempre ativo através do nosso telefone e WhatsApp corporativo listados em nosso rodapé.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <FooterHome />
        </div>
    );
}
