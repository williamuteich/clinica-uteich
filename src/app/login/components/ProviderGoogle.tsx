"use client"

import { signIn } from "next-auth/react"

export function ProviderGoogle() {
    return (
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 translate-x-20 -translate-y-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-20 translate-y-20 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6 lg:hidden">
                        <img
                            src="/logoHeader.png"
                            alt="Uteich Odontologia"
                            className="h-12 w-auto object-contain"
                        />
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Painel Administrativo</h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        Faça login na plataforma interna da Uteich Odontologia utilizando sua credencial do Google corporativo.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            i
                        </div>
                        <p className="text-xs text-blue-800 leading-normal font-medium">
                            Apenas e-mails autorizados da clínica possuem acesso a este painel administrativo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/admin' })}
                        className="cursor-pointer w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
                    >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Entrar com o Google</span>
                    </button>
                </div>
            </div>
        </div>
    )
}