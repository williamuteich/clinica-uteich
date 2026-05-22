import { Users, FileText, CalendarCheck } from "lucide-react";

export function SidebarLogin() {
    return (
        <div className="relative hidden w-full lg:flex lg:w-1/2 bg-slate-950 flex-col justify-between p-12 overflow-hidden">
            <div
                className="absolute inset-0 z-0 opacity-25 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 z-0 bg-linear-to-br from-slate-950 via-slate-900/90 to-blue-950/80" />

            <div className="relative z-10 flex items-center gap-3">
                <img
                    src="/logoHeader.png"
                    alt="Uteich Odontologia"
                    className="h-10 w-auto object-contain brightness-0 invert"
                />
            </div>

            <div className="relative z-10 max-w-lg mt-12 mb-auto pt-24">
                <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
                    Gestão inteligente para sua <br />
                    <span className="text-blue-400">clínica odontológica</span>
                </h1>

                <p className="text-slate-400 text-lg mb-12">
                    Controle pacientes, prontuários e agendamentos em uma única plataforma robusta e segura.
                </p>

                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Gestão de Pacientes</h3>
                            <p className="text-slate-400 text-sm mt-1">Cadastro completo com histórico clínico e contatos</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Prontuários Seguros</h3>
                            <p className="text-slate-400 text-sm mt-1">Acesso rápido a tratamentos, imagens e evoluções</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800">
                            <CalendarCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg">Agenda Integrada</h3>
                            <p className="text-slate-400 text-sm mt-1">Organização simplificada para toda a equipe médica</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-sm text-slate-500">
                    © 2026 Uteich Odontologia - Todos os direitos reservados
                </p>
            </div>
        </div>
    )
}