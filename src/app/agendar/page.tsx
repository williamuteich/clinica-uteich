"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderHome } from "../components/home/HeaderHome";
import { FooterHome } from "../components/home/FooterHome";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Stethoscope,
  Smile,
  ShieldCheck,
  CalendarCheck
} from "lucide-react";

const PROCEDURES = [
  "Consulta de Avaliação",
  "Limpeza e Profilaxia",
  "Clareamento Dental",
  "Aparelho Ortodôntico",
  "Implante Dentário",
  "Prótese Dentária",
  "Extração",
  "Restauração",
  "Outros / Falar com atendente",
];

const generateTimeSlots = () => {
  const slots = [];
  let startMinutes = 10 * 60;
  const endMinutes = 19 * 60 + 30;

  while (startMinutes <= endMinutes) {
    const hours = Math.floor(startMinutes / 60);
    const mins = startMinutes % 60;
    const timeString = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    slots.push(timeString);
    startMinutes += 15;
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

function SchedulingForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("servico") || "";

  const getMappedService = (srv: string) => {
    if (!srv) return "Consulta de Avaliação";
    if (srv === "Avaliação Gratuita") return "Consulta de Avaliação";
    if (srv === "Aparelho Ortodôntico") return "Aparelho Ortodôntico";
    if (srv === "Prótese e Implante") return "Prótese Dentária";
    if (srv === "Estética e Clareamento") return "Clareamento Dental";
    if (srv === "Extração e Restauração") return "Extração";
    if (srv === "Clínico Geral") return "Consulta de Avaliação";
    if (PROCEDURES.includes(srv)) return srv;
    return "Outros / Falar com atendente";
  };

  const getDefaultDate = () => {
    const d = new Date();
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }
    return d.toLocaleDateString("en-CA");
  };

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState(getMappedService(initialService));
  const [observation, setObservation] = useState("");
  const [selectedDate, setSelectedDate] = useState(getDefaultDate);
  const [selectedTime, setSelectedTime] = useState("");

  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  useEffect(() => {
    if (initialService) {
      setServiceType(getMappedService(initialService));
    }
  }, [initialService]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  useEffect(() => {
    if (!selectedDate) return;

    const fetchBookedTimes = async () => {
      setLoadingSlots(true);
      setErrorMessage("");
      try {
        const res = await fetch(`/api/agendamentos?date=${selectedDate}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const times = data.appointments.map((apt: { scheduledAt: string }) => {
          const d = new Date(apt.scheduledAt);
          const utcOffset = -3 * 60;
          const localTime = new Date(d.getTime() + (utcOffset + d.getTimezoneOffset()) * 60000);
          return `${String(localTime.getHours()).padStart(2, "0")}:${String(localTime.getMinutes()).padStart(2, "0")}`;
        });
        setBookedTimes(times);
      } catch (err) {
        console.error("Erro ao buscar horários agendados", err);
        setErrorMessage("Não foi possível carregar os horários disponíveis. Tente novamente.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedTimes();
    setSelectedTime("");
  }, [selectedDate]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nome completo é obrigatório");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Informe um número de telefone com DDD válido");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Selecione uma data e um horário");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          serviceType,
          observation,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao agendar consulta");
      }

      const whatsappUrl = `https://api.whatsapp.com/send/?phone=5551991581059&text=${encodeURIComponent(
        `Olá, acabei de solicitar um agendamento no site!\nNome: ${data.patientName || name}\nServiço: ${serviceType}\nData: ${formatBrazilianDate(selectedDate)}\nHorário: ${selectedTime}`
      )}&type=phone_number&app_absent=0`;

      window.location.assign(whatsappUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const isTimeSlotDisabled = (timeStr: string) => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    if (selectedDate === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [slotH, slotM] = timeStr.split(":").map(Number);
      const slotMinutes = slotH * 60 + slotM;
      if (slotMinutes <= currentMinutes + 10) {
        return true;
      }
    }

    const [proposedH, proposedM] = timeStr.split(":").map(Number);
    const proposedTotalMinutes = proposedH * 60 + proposedM;

    for (const booked of bookedTimes) {
      const [bookedH, bookedM] = booked.split(":").map(Number);
      const bookedTotalMinutes = bookedH * 60 + bookedM;
      if (Math.abs(proposedTotalMinutes - bookedTotalMinutes) < 15) {
        return true;
      }
    }

    return false;
  };

  const availableTimeSlots = TIME_SLOTS.filter((timeStr) => !isTimeSlotDisabled(timeStr));

  const getMinDate = () => {
    return new Date().toLocaleDateString("en-CA");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (!dateStr) return;

    const dateObj = new Date(dateStr + "T00:00:00");
    if (dateObj.getDay() === 0) {
      setErrorMessage("A clínica atende aos domingos somente em casos de emergência.");
      setShowEmergencyContact(true);
      setSelectedDate("");
      setSelectedTime("");
    } else {
      setErrorMessage("");
      setShowEmergencyContact(false);
      setSelectedDate(dateStr);
    }
  };

  const formatBrazilianDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeaderHome />

      <main className="flex-1 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}></div>

        <div className="mx-auto max-w-[1050px] px-4 relative z-10">
          <div className="grid md:grid-cols-[1.1fr_1.9fr] gap-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-border">

            <div className="hidden md:flex gradient-card text-white p-8 flex-col justify-between relative">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[16px_16px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  CRO 32301 · Dr. Lenon Uteich
                </div>

                <h1 className="mt-6 text-3xl font-bold tracking-tight leading-tight">
                  Agende sua<br />Consulta em<br />
                  <span className="text-accent-light">Poucos Passos.</span>
                </h1>

                <p className="mt-4 text-sm text-white/80 leading-relaxed">
                  Escolha o procedimento de sua preferência, data e horário ideal.
                  Nosso sistema verificará automaticamente a agenda da clínica e se você já possui cadastro.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <Stethoscope className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Tecnologia de Ponta</p>
                      <p className="text-[11px] text-white/70">Equipamentos modernos e técnicas avançadas.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <Clock className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Horários Flexíveis</p>
                      <p className="text-[11px] text-white/70">Atendimento de Segunda a Sábado até as 19:30.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <Smile className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Atendimento Sem Dor</p>
                      <p className="text-[11px] text-white/70">Cuidado humanizado e conforto absoluto.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/60">
                <p>Uteich Odontologia © {new Date().getFullYear()}</p>
                <p className="mt-1">Rua Papa João XXIII, 80 – Cachoeirinha - RS</p>
              </div>
            </div>

            <div className="p-6 md:p-10 flex flex-col justify-center min-h-[500px]">
              {step < 3 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    <span>Passo {step} de 2</span>
                    <span>{step === 1 ? "Dados Pessoais" : "Serviço e Data"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: step === 1 ? "50%" : "100%" }}
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 space-y-3 animate-in fade-in duration-300">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold leading-relaxed">{errorMessage}</p>
                  </div>

                  {showEmergencyContact && (
                    <a
                      href="tel:5551991581059"
                      className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                    >
                      <Phone className="h-4 w-4" />
                      Botão de Emergência
                    </a>
                  )}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleNextStep}
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
                            onChange={handlePhoneChange}
                            className="w-full h-11 pl-10 pr-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-slate-800"
                          />
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1.5">
                          Usaremos este número para verificar se você já tem cadastro e confirmar o atendimento.
                        </p>
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
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-primary hover:bg-primary-deep text-white font-bold rounded-xl transition-all shadow-button hover:-translate-y-px active:translate-y-0 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      Continuar Agendamento
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-primary-deep">Quando deseja ser atendido(a)?</h2>
                      <p className="text-xs text-muted-foreground mt-1">Selecione o procedimento e escolha um dia e horário de segunda a sábado.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                          O que você precisa? <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                          className="w-full h-11 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold text-slate-800 bg-white"
                        >
                          {PROCEDURES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Escolha a Data <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            type="date"
                            required
                            min={getMinDate()}
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full h-11 pl-10 pr-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 bg-white"
                          />
                        </div>
                      </div>

                      {selectedDate && (
                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 items-center justify-between">
                            <span>Horários Disponíveis</span>
                            {loadingSlots && (
                              <span className="text-primary font-bold animate-pulse flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Verificando...
                              </span>
                            )}
                          </label>

                          {loadingSlots ? (
                            <div className="grid grid-cols-4 gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="h-9 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
                              ))}
                            </div>
                          ) : availableTimeSlots.length === 0 ? (
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                              Nenhum horário disponível para esta data.
                            </div>
                          ) : (
                            <div className="max-h-[160px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {availableTimeSlots.map((timeStr) => {
                                  const selected = selectedTime === timeStr;

                                  return (
                                    <button
                                      key={timeStr}
                                      type="button"
                                      onClick={() => setSelectedTime(timeStr)}
                                      className={`h-9 text-xs font-bold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${selected
                                        ? "bg-primary border-primary text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-primary/5"
                                        }`}
                                    >
                                      {timeStr}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Intervalo de 15 min garantido para evitar atrasos e aglomerações.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 h-11 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={submitting || !selectedDate || !selectedTime}
                        onClick={handleSubmit}
                        className="flex-1 h-11 bg-primary hover:bg-primary-deep text-white font-bold rounded-xl transition-all shadow-button hover:-translate-y-px active:translate-y-0 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Agendando...
                          </>
                        ) : (
                          <>
                            Confirmar Agendamento
                            <CalendarCheck className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>
        </div>
      </main>

      <FooterHome />
    </div>
  );
}

export default function AgendarPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <SchedulingForm />
    </Suspense>
  );
}
