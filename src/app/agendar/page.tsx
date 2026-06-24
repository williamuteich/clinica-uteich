"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderHome } from "../components/home/HeaderHome";
import { FooterHome } from "../components/home/FooterHome";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { BookingHero } from "./components/booking-hero";
import { StepIndicator } from "./components/step-indicator";
import { ErrorMessageAlert } from "./components/error-message-alert";
import { StepOneForm } from "./components/step-one-form";
import { StepTwoForm } from "./components/step-two-form";

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
    if (!srv) return "";
    const decoded = decodeURIComponent(srv);
    const validServices = [
      "Avaliação Gratuita",
      "Clínico Geral",
      "Prótese e Implante",
      "Aparelho Ortodôntico",
      "Tratamento de Canal",
      "Estética e Clareamento",
      "Extração e Restauração"
    ];
    const matched = validServices.find(s => s.toLowerCase() === decoded.toLowerCase());
    return matched || "Outros";
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [leadId, setLeadId] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("leadId");
    if (saved) {
      setLeadId(saved);
    }
  }, []);

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

  const handleNextStep = async (e: React.FormEvent) => {
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
    if (!serviceType) {
      setErrorMessage("Por favor, selecione o serviço desejado");
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage("Você precisa aceitar a Política de Privacidade e os Termos de Uso");
      return;
    }
    setErrorMessage("");

    try {
      const gclid = searchParams.get("gclid") || "";
      const utmSource = searchParams.get("utm_source") || "";
      const utmMedium = searchParams.get("utm_medium") || "";
      const utmCampaign = searchParams.get("utm_campaign") || "";
      const utmContent = searchParams.get("utm_content") || "";
      const utmTerm = searchParams.get("utm_term") || "";

      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: leadId || undefined,
          name,
          phone,
          serviceType,
          observation: observation || undefined,
          gclid: gclid || undefined,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          utmContent: utmContent || undefined,
          utmTerm: utmTerm || undefined,
          conversionUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.leadId) {
        setLeadId(data.leadId);
        sessionStorage.setItem("leadId", data.leadId);
      }
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }

    setStep(2);
  };

  const formatBrazilianDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Selecione uma data e um horário");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      const gclid = searchParams.get("gclid") || "";
      const utmSource = searchParams.get("utm_source") || "";
      const utmMedium = searchParams.get("utm_medium") || "";
      const utmCampaign = searchParams.get("utm_campaign") || "";
      const utmContent = searchParams.get("utm_content") || "";
      const utmTerm = searchParams.get("utm_term") || "";

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
          acceptedTerms,
          leadId: leadId || undefined,
          gclid: gclid || undefined,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          utmContent: utmContent || undefined,
          utmTerm: utmTerm || undefined,
          conversionUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao agendar consulta");
      }
      
      sessionStorage.removeItem("leadId");
      setLeadId("");

      const message = [
        "Olá, acabei de solicitar um agendamento no site!",
        `Nome: ${data.patientName || name}`,
        `Data: ${formatBrazilianDate(selectedDate)}`,
        `Horário: ${selectedTime}`,
        observation ? `Observação: ${observation}` : null
      ].filter(Boolean).join("\n");

      const whatsappUrl = `https://api.whatsapp.com/send/?phone=5551991581059&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeaderHome />
      <main className="flex-1 py-12 md:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="mx-auto max-w-[1050px] px-4 relative z-10">
          <div className="grid md:grid-cols-[1.1fr_1.9fr] gap-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-border">
            <BookingHero year={new Date().getFullYear()} />
            <div className="p-6 md:p-10 flex flex-col justify-center min-h-[500px]">
              {step < 3 && <StepIndicator step={step} />}
              {errorMessage && (
                <ErrorMessageAlert message={errorMessage} showEmergency={showEmergencyContact} />
              )}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <StepOneForm
                    name={name}
                    setName={setName}
                    phone={phone}
                    onChangePhone={handlePhoneChange}
                    serviceType={serviceType}
                    setServiceType={setServiceType}
                    observation={observation}
                    setObservation={setObservation}
                    acceptedTerms={acceptedTerms}
                    setAcceptedTerms={setAcceptedTerms}
                    onSubmit={handleNextStep}
                  />
                )}
                {step === 2 && (
                  <StepTwoForm
                    minDate={getMinDate()}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    loadingSlots={loadingSlots}
                    availableTimeSlots={availableTimeSlots}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    onBack={() => setStep(1)}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                  />
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <SchedulingForm />
    </Suspense>
  );
}
