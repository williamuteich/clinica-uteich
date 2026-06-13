import { requirePermission } from "@/src/lib/auth-helpers-server";
import { Puzzle, Download, Smartphone } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
    title: "Extensão CRM | Uteich Odontologia",
    description: "Instruções para download e ativação da extensão do CRM no WhatsApp Web.",
};

async function ExtensaoContent() {
    await requirePermission("extensao", "visualizar");

    return (
        <div className="hidden lg:flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4 shadow-xs">
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Download da Extensão</h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Baixe o arquivo compactado da extensão (.zip) para iniciar o processo de instalação manual.
                    </p>
                </div>
                <a
                    href="https://drive.google.com/file/d/1benv0unrzeX_bW91VqnopE-XN4njVf1_/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                    <Download className="h-4 w-4" />
                    Baixar Extensão (.zip)
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                        Passo a Passo de Instalação
                    </h2>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                        <div className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                                1
                            </span>
                            <div>
                                <strong className="text-slate-850 block mb-0.5">Fazer o download</strong>
                                Baixe o arquivo ZIP da extensão usando o botão de download acima.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                                2
                            </span>
                            <div>
                                <strong className="text-slate-850 block mb-0.5">Descompactar a pasta</strong>
                                Extraia os arquivos do ZIP (<code>extensao.zip</code>). Ao descompactar, você verá uma pasta chamada <code>dist</code>. É essa pasta que será carregada.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                                3
                            </span>
                            <div>
                                <strong className="text-slate-850 block mb-0.5">Acessar as Extensões do Navegador</strong>
                                Abra uma nova guia no Chrome, acesse <code className="bg-slate-50 px-1 py-0.5 rounded border text-blue-600 font-mono text-[10px]">chrome://extensions</code> ou acesse o menu de Extensões do navegador.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                                4
                            </span>
                            <div>
                                <strong className="text-slate-850 block mb-0.5">Ativar o Modo de Desenvolvedor</strong>
                                No canto superior direito da página de Extensões, ative a chave do <strong>Modo do desenvolvedor</strong>.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                                5
                            </span>
                            <div>
                                <strong className="text-slate-850 block mb-0.5">Carregar a pasta dist</strong>
                                Clique em <strong>Carregar sem compactação</strong> no canto superior esquerdo e selecione especificamente a pasta <code>dist</code> extraída no Passo 2.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                                ✓
                            </span>
                            <div>
                                <strong className="text-emerald-700 block mb-0.5">Pronto!</strong>
                                A extensão está ativa. Abra o WhatsApp Web no navegador para exibir o painel lateral do CRM integrado.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                        Navegadores Compatíveis
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-xs font-semibold text-slate-700">Google Chrome</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Recomendado</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-xs font-semibold text-slate-700">Microsoft Edge</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Compatível</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-xs font-semibold text-slate-700">Brave Browser</span>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Compatível</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-xs font-semibold text-slate-700">Opera / Opera GX</span>
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Compatível</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExtensaoLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-slate-100 h-20 rounded-xl border border-slate-200" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-100 h-96 rounded-xl border border-slate-200" />
                <div className="bg-slate-100 h-56 rounded-xl border border-slate-200" />
            </div>
        </div>
    );
}

export default function ExtensaoPage() {
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5 text-slate-800">
                    <Puzzle className="h-6 w-6 text-blue-600" />
                    Extensão WhatsApp CRM
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Integre o CRM da clínica diretamente no seu WhatsApp Web para gerenciar pacientes e consultas em tempo real.
                </p>
            </div>

            <div className="block lg:hidden">
                <div className="flex flex-col items-center justify-center text-center p-6 bg-amber-50 rounded-xl border border-amber-200/60">
                    <Smartphone className="h-7 w-7 text-amber-500 mb-3" />
                    <h2 className="text-sm font-semibold text-slate-800">Apenas para Computador</h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                        A extensão do WhatsApp Web deve ser instalada e utilizada apenas em computadores/desktop.
                    </p>
                </div>
            </div>

            <Suspense fallback={<ExtensaoLoading />}>
                <ExtensaoContent />
            </Suspense>
        </div>
    );
}
