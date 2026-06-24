import { motion } from "framer-motion";
import { User, Phone, MessageSquare, ChevronRight } from "lucide-react";
import { StepOneProps } from "@/src/types/home/agendar";

export function StepOneForm({
  name,
  setName,
  phone,
  onChangePhone,
  serviceType,
  setServiceType,
  observation,
  setObservation,
  acceptedTerms,
  setAcceptedTerms,
  onSubmit,
}: StepOneProps) {
  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-primary-deep">Como podemos te chamar?</h2>
        <p className="text-xs text-muted-foreground mt-1">Preencha seus dados de contato para iniciarmos o agendamento.</p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Nome Completo <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800"
            />
          </div>
        </div>
        <div className="relative">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Telefone / WhatsApp <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              required
              placeholder="(51) 99999-9999"
              value={phone}
              onChange={onChangePhone}
              className="w-full h-11 pl-10 pr-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-slate-800"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1.5">
            Usaremos este número para verificar se você já tem cadastro e confirmar o atendimento.
          </p>
        </div>
        <div className="relative">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Serviço Desejado <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              required
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full h-11 px-3.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 bg-white"
            >
              <option value="">Selecione o serviço...</option>
              <option value="Avaliação Gratuita">Avaliação Gratuita</option>
              <option value="Clínico Geral">Clínico Geral</option>
              <option value="Prótese e Implante">Prótese e Implante</option>
              <option value="Aparelho Ortodôntico">Aparelho Ortodôntico</option>
              <option value="Tratamento de Canal">Tratamento de Canal</option>
              <option value="Estética e Clareamento">Estética e Clareamento</option>
              <option value="Extração e Restauração">Extração e Restauração</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Alguma observação ou sintoma? <span className="text-muted-foreground/60">(Opcional)</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              placeholder="Ex: Dor de dente, quebra de dente, limpeza de rotina, etc."
              rows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 resize-none"
            />
          </div>
        </div>
        
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="accept-terms"
            required
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
          />
          <label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-normal cursor-pointer select-none">
            Li e aceito a{" "}
            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-deep font-semibold hover:underline hover:text-primary transition-colors"
            >
              Política de Privacidade
            </a>{" "}
            e os{" "}
            <a
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-deep font-semibold hover:underline hover:text-primary transition-colors"
            >
              Termos de Uso
            </a>{" "}
            da clínica. <span className="text-rose-500">*</span>
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary-deep text-white font-bold rounded-xl transition-all shadow-button hover:-translate-y-px active:translate-y-0 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
      >
        Continuar Agendamento
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.form>
  );
}
