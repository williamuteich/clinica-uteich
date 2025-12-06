export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
}

export const services: Service[] = [
  {
    id: "emergencia",
    name: "Emergência 24h",
    description: "Atendimento de emergência odontológica disponível a qualquer hora do dia ou da noite.",
    icon: "AlertCircle",
    duration: 30,
  },
  {
    id: "avaliacao",
    name: "Avaliação Gratuita",
    description: "Consulta inicial completa para avaliar sua saúde bucal e criar um plano de tratamento personalizado.",
    icon: "ClipboardCheck",
    duration: 30,
  },
  {
    id: "clinico-geral",
    name: "Clínico Geral",
    description: "Tratamentos preventivos e curativos para manter sua saúde bucal em dia.",
    icon: "Stethoscope",
    duration: 45,
  },
  {
    id: "protese-implante",
    name: "Prótese e Implante",
    description: "Reabilitação oral com próteses e implantes de alta qualidade para devolver seu sorriso.",
    icon: "Crown",
    duration: 60,
  },
  {
    id: "ortodontia",
    name: "Aparelho Ortodôntico",
    description: "Correção do alinhamento dental com aparelhos modernos e eficientes.",
    icon: "Smile",
    duration: 45,
  },
  {
    id: "canal",
    name: "Tratamento de Canal",
    description: "Tratamento endodôntico para salvar dentes comprometidos e eliminar dores.",
    icon: "Target",
    duration: 90,
  },
  {
    id: "estetica",
    name: "Estética e Clareamento",
    description: "Procedimentos estéticos para um sorriso mais branco e harmonioso.",
    icon: "Sparkles",
    duration: 60,
  },
  {
    id: "extracao",
    name: "Extração e Restauração",
    description: "Procedimentos cirúrgicos e restaurações dentárias com técnicas modernas.",
    icon: "Wrench",
    duration: 45,
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

export const filterAvailableTimeSlots = (date: string, serviceId?: string) => {
  const selectedDateObj = new Date(date + 'T12:00:00');
  const today = new Date();
  const dayOfWeek = selectedDateObj.getDay();

  let slotsForDay;
  if (serviceId === 'emergencia') {
    slotsForDay = emergency24hTimeSlots;
  } else {
    slotsForDay = dayOfWeek === 6 ? saturdayTimeSlots : weekdayTimeSlots;
  }

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
  whatsapp: "5199158-1059",
  whatsappFormatted: "(51) 99158-1059",
  hours: "Seg-Sex: 8h-20h | Sáb: 9h-18h",
  emergency24h: true,
  emergencyMessage: "Atendimento de emergência disponível 24h",
  email: "contato@uteich.com.br",
  social: {
    instagram: "https://www.instagram.com/uteichodontologia/",
    facebook: "https://www.facebook.com/profile.php?id=61582793833076",
  },
  defaultMessage: "Olá! Gostaria de mais informações sobre os serviços da Uteich Odontologia.",
};
