import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Acesso Não Autorizado</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Desculpe, você não tem as permissões necessárias para acessar esta página. 
                Se você acredita que isso é um erro, entre em contato com o administrador mestre.
            </p>
            
            <Link href="/admin">
                <Button className="bg-slate-900 hover:bg-slate-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                </Button>
            </Link>
        </div>
    );
}
