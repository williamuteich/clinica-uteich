import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Turnstile } from "@/components/Turnstile";

interface Props {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Credenciais inválidas", variant: "destructive" });
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4 shadow-button">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-gray-900 font-semibold text-xl">Área Administrativa</h1>
          <p className="text-gray-400 text-sm mt-1">Uteich Odontologia</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1.5">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@uteich.com.br"
              />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1.5">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-center py-2">
              <Turnstile
                siteKey="0x4AAAAAACMyfG61zPTQ60uU"
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading || !turnstileToken}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}
