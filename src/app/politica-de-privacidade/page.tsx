import { HeaderHome } from "../components/home/HeaderHome";
import { FooterHome } from "../components/home/FooterHome";
import { Shield } from "lucide-react";

export const metadata = {
    title: "Política de Privacidade | Uteich Odontologia",
    description: "Política de Privacidade da clínica Uteich Odontologia, em conformidade com a LGPD (Lei Geral de Proteção de Dados). Saiba como tratamos seus dados.",
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderHome />
            <main className="flex-1 max-w-[850px] mx-auto px-4 py-12 md:py-20 w-full">
                <div className="bg-white border border-slate-200 p-6 md:p-10 shadow-sm rounded-none">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
                        <Shield className="w-8 h-8 text-primary-deep" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                Política de Privacidade
                            </h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                                Uteich Odontologia • Última atualização: Junho de 2026
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                        <p>
                            A <strong>Uteich Odontologia</strong> valoriza a privacidade e a segurança dos dados pessoais de seus pacientes e visitantes. Esta política detalha como coletamos, usamos, armazenamos e protegemos suas informações em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>.
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">1</span>
                                Dados Coletados
                            </h2>
                            <p>
                                Coletamos dados em diferentes momentos da sua interação conosco:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>No Site (Formulário de Agendamento):</strong> Nome completo, número de telefone/WhatsApp e observações fornecidas voluntariamente para a marcação da consulta.
                                </li>
                                <li>
                                    <strong>No Consultório (Ficha Clínica &amp; Sistema Admin Interno):</strong> CPF, endereço residencial, data de nascimento, além de dados sensíveis de saúde (anamnese clínica, histórico médico bucal, tratamentos executados e registros radiológicos), que são obrigatórios por lei para a prestação dos serviços odontológicos.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">2</span>
                                Finalidade do Tratamento
                            </h2>
                            <p>
                                O processamento dos dados coletados possui finalidades legais e assistenciais específicas:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Agendamento:</strong> Facilitar o contato para agendamento, confirmação e remarcação de consultas de avaliação.</li>
                                <li><strong>Prontuário Odontológico:</strong> Registro clínico obrigatório exigido pelo Conselho Federal de Odontologia (CFO) e Lei nº 5.081/66, garantindo a continuidade do tratamento de forma segura.</li>
                                <li><strong>Faturamento:</strong> Emissão de recibos, notas fiscais e relatórios administrativos internos.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">3</span>
                                Armazenamento e Segurança
                            </h2>
                            <p>
                                Seus dados de saúde e cadastrais são armazenados em um sistema de prontuário eletrônico interno seguro, com acesso estritamente restrito aos profissionais de saúde e recepcionistas autorizados da clínica. Adotamos medidas técnicas de segurança da informação para evitar acessos não autorizados, perdas ou vazamentos de dados.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">4</span>
                                Direitos do Titular dos Dados
                            </h2>
                            <p>
                                Conforme a LGPD, você possui o direito de:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Confirmar a existência do tratamento e acessar seus dados pessoais.</li>
                                <li>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
                                <li>Solicitar a portabilidade ou eliminação de dados pessoais desnecessários.</li>
                            </ul>
                            <p className="text-xs text-slate-500 italic mt-2">
                                *Nota Legal: Em decorrência de obrigação legal e regulatória do CFO (Resolução CFO-91/2009), os registros de prontuários clínicos e dados de anamnese do paciente devem ser mantidos pela clínica por um prazo mínimo de 20 anos, impedindo a sua eliminação definitiva antes desse período.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-none bg-slate-100 text-slate-700 text-xs font-bold">5</span>
                                Contato e Canal LGPD
                            </h2>
                            <p>
                                Para exercer seus direitos ou esclarecer qualquer dúvida em relação ao tratamento dos seus dados, entre em contato diretamente com a nossa administração através do e-mail: <a href="mailto:uteichodontologia@gmail.com" className="text-primary-deep font-semibold hover:underline">uteichodontologia@gmail.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <FooterHome />
        </div>
    );
}
