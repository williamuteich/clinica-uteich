import { Suspense } from "react";
import { prisma } from "@/src/lib/prisma";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

import PatientRegistrationWizard from "../components/PatientRegistrationWizard";

async function FormPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const generatedLink = await prisma.generatedLink.findUnique({
        where: { token: id },
    });

    if (!generatedLink) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-850">Link Inválido</h1>
                    <p className="text-sm text-slate-500">
                        Este link de formulário não existe ou é inválido. Por favor, confirme o link enviado.
                    </p>
                </div>
            </div>
        );
    }

    if (generatedLink.used) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-850">Link já Utilizado</h1>
                    <p className="text-sm text-slate-500">
                        Este formulário de cadastro já foi preenchido e enviado com sucesso.
                    </p>
                </div>
            </div>
        );
    }

    const isExpired = new Date() > new Date(generatedLink.expiresAt);
    if (isExpired) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="h-8 w-8" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-850">Link Expirado</h1>
                    <p className="text-sm text-slate-500">
                        Este link de cadastro expirou. Por favor, entre em contato com a administração da clínica para obter um novo link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8">
            <PatientRegistrationWizard
                patientName={generatedLink.patientName}
                formType={generatedLink.formType}
                token={generatedLink.token}
            />
        </div>
    );
}

function FormPageSkeleton() {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
}

export default function FormPageWrapper({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<FormPageSkeleton />}>
            <FormPage params={params} />
        </Suspense>
    );
}
