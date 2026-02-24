import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, User, Stethoscope } from "lucide-react";

interface BookingSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  data: {
    serviceName: string;
    date: string;
    time: string;
    patientName: string;
  };
}

export const BookingSuccessDialog = ({ open, onClose, data }: BookingSuccessDialogProps) => {
  const formattedDate = new Date(data.date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-auto rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        {/* Top gradient banner */}
        <div className="gradient-hero px-6 pt-8 pb-10 text-center relative">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 animate-fade-in">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Consulta Confirmada!
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/90 text-sm mt-2">
            Seu agendamento foi registrado com sucesso
          </p>
        </div>

        {/* Details card */}
        <div className="px-6 -mt-4 pb-6">
          <div className="bg-card rounded-xl shadow-card p-5 space-y-4 border">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg gradient-card flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Serviço</p>
                <p className="font-semibold text-foreground text-sm">{data.serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg gradient-card flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profissional</p>
                <p className="font-semibold text-foreground text-sm">Dr. Lenon Uteich</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg gradient-card flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-semibold text-foreground text-sm capitalize">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg gradient-card flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horário</p>
                <p className="font-semibold text-foreground text-sm">{data.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg gradient-card flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paciente</p>
                <p className="font-semibold text-foreground text-sm">{data.patientName}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Entraremos em contato para confirmar sua consulta. 😊
          </p>

          <Button onClick={onClose} size="lg" className="w-full mt-4 rounded-xl">
            Entendi, obrigado!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
