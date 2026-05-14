export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
  whatsappMessage?: string;
}

export const services: Service[] = [
  {
    id: "emergencia",
    name: "Emergência 24h",
    description: "Atendimento de emergência odontológica disponível a qualquer hora do dia ou da noite.",
    icon: "AlertCircle",
    duration: 30,
    whatsappMessage: "Olá! Preciso de um atendimento de EMERGÊNCIA na Uteich Odontologia.",
  },
  {
    id: "avaliacao",
    name: "Avaliação Gratuita",
    description: "Consulta inicial completa para avaliar sua saúde bucal e criar um plano de tratamento personalizado.",
    icon: "ClipboardCheck",
    duration: 30,
    whatsappMessage: "Olá! Gostaria de agendar minha AVALIAÇÃO GRATUITA na Uteich Odontologia.",
  },
  {
    id: "clinico-geral",
    name: "Clínico Geral",
    description: "Tratamentos preventivos e curativos para manter sua saúde bucal em dia.",
    icon: "Stethoscope",
    duration: 45,
    whatsappMessage: "Olá! Gostaria de agendar uma consulta com um CLÍNICO GERAL na Uteich Odontologia.",
  },
  {
    id: "protese-implante",
    name: "Prótese e Implante",
    description: "Reabilitação oral com próteses e implantes de alta qualidade para devolver seu sorriso.",
    icon: "Crown",
    duration: 60,
    whatsappMessage: "Olá! Gostaria de mais informações sobre PRÓTESES E IMPLANTES na Uteich Odontologia.",
  },
  {
    id: "ortodontia",
    name: "Aparelho Ortodôntico",
    description: "Correção do alinhamento dental com aparelhos modernos e eficientes.",
    icon: "Smile",
    duration: 45,
    whatsappMessage: "Olá! Gostaria de saber mais sobre o tratamento com APARELHO ORTODÔNTICO na Uteich Odontologia.",
  },
  {
    id: "canal",
    name: "Tratamento de Canal",
    description: "Tratamento endodôntico para salvar dentes comprometidos e eliminar dores.",
    icon: "Target",
    duration: 90,
    whatsappMessage: "Olá! Gostaria de agendar um TRATAMENTO DE CANAL na Uteich Odontologia.",
  },
  {
    id: "estetica",
    name: "Estética e Clareamento",
    description: "Procedimentos estéticos para um sorriso mais branco e harmonioso.",
    icon: "Sparkles",
    duration: 60,
    whatsappMessage: "Olá! Gostaria de informações sobre ESTÉTICA E CLAREAMENTO DENTAL na Uteich Odontologia.",
  },
  {
    id: "extracao",
    name: "Extração e Restauração",
    description: "Procedimentos cirúrgicos e restaurações dentárias com técnicas modernas.",
    icon: "Wrench",
    duration: 45,
    whatsappMessage: "Olá! Gostaria de agendar uma EXTRAÇÃO OU RESTAURAÇÃO na Uteich Odontologia.",
  },
];

export const weekdayTimeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

export const saturdayTimeSlots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30"
];

export const emergency24hTimeSlots = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30",
  "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
];

export const filterAvailableTimeSlots = (date: string, _serviceId?: string) => {
  const selectedDateObj = new Date(date + 'T12:00:00');
  const today = new Date();

  const slotsForDay = emergency24hTimeSlots;

  if (selectedDateObj.toDateString() === today.toDateString()) {
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    return slotsForDay.filter(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
    });
  }

  return slotsForDay;
};

export const clinicInfo = {
  name: "Uteich Odontologia",
  doctor: "Dr. Lenon Uteich",
  cro: "32301",
  address: "Rua Papa João XXIII, 80 – Vila Cachoeirinha – Cachoeirinha – RS",
  whatsapp: "51991581059",
  whatsappFormatted: "(51) 99158-1059",
  emergencyPhone: "991581059",
  hours: "Seg-Sex: 8h-20h | Sáb: 9h-18h",
  emergency24h: true,
  emergencyMessage: "Atendimento de emergência disponível 24h",
  email: "contato@uteich.com.br",
  social: {
    instagram: "https://www.instagram.com/uteichodontologia/",
    facebook: "https://www.facebook.com/people/Uteich-Odontologia/61582793833076/",
  },
  whatsappLink: "https://api.whatsapp.com/send/?phone=5551991581059&text=Ol%C3%A1%21+Gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+os+servi%C3%A7os+da+Uteich+Odontologia.&type=phone_number&app_absent=0",
  defaultMessage: "Olá! Gostaria de mais informações sobre os serviços da Uteich Odontologia.",
};
