import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { services, clinicInfo, filterAvailableTimeSlots } from "@/data/services";
import { Calendar, Clock, User, Phone, FileText, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("servico") || "";

  const [step, setStep] = useState(initialService ? 2 : 1);
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: ""
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');

      let masked = numbers;
      if (numbers.length <= 11) {
        masked = numbers.replace(/(\d{2})(\d)/, '($1) $2');
        if (numbers.length > 6) {
          masked = masked.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
        }
      }

      setFormData({ ...formData, [name]: masked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive"
      });
      return;
    }

    const service = services.find(s => s.id === selectedService);
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('pt-BR');

    const message = encodeURIComponent(
      `Olá, gostaria de confirmar meu agendamento:\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*Serviço:* ${service?.name}\n` +
      `*Data:* ${formattedDate}\n` +
      `*Hora:* ${selectedTime}\n` +
      `*Telefone:* ${formData.phone}\n` +
      (formData.notes ? `*Observações:* ${formData.notes}` : '')
    );

    const whatsappUrl = `https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Redirecionando para o WhatsApp",
      description: "Complete seu agendamento pelo WhatsApp.",
    });
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = generateDates();

  return (
    <Layout>
      <SEO
        title="Agendar Consulta Online | Uteich Odontologia"
        description="Agende sua consulta odontológica online de forma rápida e fácil. Avaliação gratuita disponível. Atendimento 24h em Cachoeirinha."
        keywords="agendar dentista cachoeirinha, consulta odontológica online, avaliação dentista gratuita"
        path="/agendamento"
      />
      <section className="relative py-16 gradient-hero overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{
          clipPath: "ellipse(80% 100% at 50% 100%)"
        }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Agendar consulta odontológica em Cachoeirinha
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Escolha o serviço, data e horário de sua preferência.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${step >= s ? 'gradient-card text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 rounded ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Selecione o Serviço
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const isEmergency = service.id === 'emergencia';
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className={`p-6 rounded-2xl text-left transition-all duration-300 ${selectedService === service.id
                          ? isEmergency
                            ? 'bg-red-600 text-white shadow-hover scale-[1.02]'
                            : 'gradient-card text-primary-foreground shadow-hover scale-[1.02]'
                          : isEmergency
                            ? 'bg-red-500 text-white shadow-card hover:shadow-hover hover:-translate-y-1'
                            : 'bg-card shadow-card hover:shadow-hover hover:-translate-y-1'
                          }`}
                      >
                        <h3 className={`font-semibold mb-2 ${selectedService === service.id
                          ? ''
                          : isEmergency
                            ? 'text-white'
                            : 'text-foreground'
                          }`}>
                          {service.name}
                        </h3>
                        <p className={`text-sm ${selectedService === service.id || isEmergency ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {service.description}
                        </p>
                        <div className={`mt-3 text-sm ${selectedService === service.id || isEmergency ? 'text-white/80' : 'text-muted-foreground'}`}>
                          <Clock className={`w-4 h-4 inline mr-1 ${selectedService === service.id || isEmergency ? 'text-white/80' : ''}`} />
                          ~{service.duration} min
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>

                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Escolha Data e Horário
                </h2>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      <Calendar className="w-5 h-5 inline mr-2" />
                      Data
                    </Label>
                    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
                      {availableDates.map((date) => {
                        const dateObj = new Date(date + 'T12:00:00');
                        const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
                        const dayNum = dateObj.getDate();
                        const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' });

                        return (
                          <button
                            key={date}
                            onClick={() => handleDateSelect(date)}
                            className={`p-3 rounded-xl text-center transition-all ${selectedDate === date
                              ? 'gradient-card text-primary-foreground'
                              : 'bg-card hover:bg-muted'
                              }`}
                          >
                            <div className="text-xs uppercase">{dayName}</div>
                            <div className="text-xl font-bold">{dayNum}</div>
                            <div className="text-xs">{month}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      <Clock className="w-5 h-5 inline mr-2" />
                      Horário
                    </Label>
                    {selectedDate ? (
                      <div className="grid grid-cols-3 gap-2">
                        {filterAvailableTimeSlots(selectedDate, selectedService).map((time) => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`p-3 rounded-xl text-center transition-all ${selectedTime === time
                              ? 'gradient-card text-primary-foreground'
                              : 'bg-card hover:bg-muted'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted rounded-xl p-8 text-center text-muted-foreground">
                        Selecione uma data primeiro
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>

                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Seus Dados
                </h2>

                <div className="bg-dental-pale rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold text-foreground mb-4">Resumo do Agendamento</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Serviço:</span>
                      <p className="font-medium text-foreground">{services.find(s => s.id === selectedService)?.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data:</span>
                      <p className="font-medium text-foreground">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horário:</span>
                      <p className="font-medium text-foreground">{selectedTime}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      WhatsApp *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(51) 99999-9999"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Observações (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Alguma informação adicional?"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Confirmar pelo WhatsApp
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Booking;
