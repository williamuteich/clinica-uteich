import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Play, CheckCircle, ClipboardCheck, Filter, Loader2, Download, Phone, Calendar } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "@/integrations/supabase/client";
import { clinicInfo } from "@/data/services";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { maskCPF, maskPhone, maskCEP, maskDate, maskCurrency, formatCurrency, dateDisplayToISO, isoToDateDisplay, unmask, isValidCPF, isValidPhone, isValidCEP, fetchAddressByCEP } from "@/lib/masks";

interface Patient {
  id: string; name: string; cpf: string; phone: string | null;
  city: string | null; state: string | null; street: string | null;
  cep: string | null; number: string | null; birth_date: string | null;
}

interface Appointment {
  id: string; patient_id: string | null; patient_name: string;
  phone: string | null; date: string; time: string;
  reason: string | null; status: string;
}

interface Attendance {
  patient_id: string; total_value: number; appointment_id: string | null;
}

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-800",
  confirmado: "bg-green-100 text-green-800",
  em_atendimento: "bg-yellow-100 text-yellow-800",
  cancelado: "bg-red-100 text-red-800",
  concluido: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_atendimento: "Em Atendimento",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

export function AgendaTab() {
  const isMobile = useIsMobile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientName: "", phone: "", date: "", time: "", reason: "", cpf: "", birth_date: "", totalValue: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("/");
  const nextWeekDisplay = (() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0].split("-").reverse().join("/");
  })();
  const [filterName, setFilterName] = useState("");
  const [filterCpf, setFilterCpf] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState(todayDisplay);
  const [filterDateTo, setFilterDateTo] = useState(nextWeekDisplay);
  const [showFilters, setShowFilters] = useState(false);

  const [startOpen, setStartOpen] = useState(false);
  const [startAppointment, setStartAppointment] = useState<Appointment | null>(null);
  const [patientData, setPatientData] = useState<{
    name: string; phone: string; cpf: string; city: string; state: string;
    street: string; cep: string; number: string; birth_date: string;
  }>({ name: "", phone: "", cpf: "", city: "", state: "", street: "", cep: "", number: "", birth_date: "" });
  const [confirmDate, setConfirmDate] = useState("");
  const [confirmTime, setConfirmTime] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [startSubmitting, setStartSubmitting] = useState(false);
  const [confirmCpfSearching, setConfirmCpfSearching] = useState(false);

  const [finishOpen, setFinishOpen] = useState(false);
  const [finishAppointment, setFinishAppointment] = useState<Appointment | null>(null);
  const [procedures, setProcedures] = useState([{ name: "" }]);
  const [totalValue, setTotalValue] = useState("");
  const [notes, setNotes] = useState("");
  const [finishSubmitting, setFinishSubmitting] = useState(false);

  const parseCurrency = (val: string) => {
    const raw = unmask(val);
    if (!raw) return 0;
    return parseFloat(raw) / 100;
  };

  const reload = async () => {
    setLoading(true);
    const { data: apps } = await supabase.from("appointments").select("*").order("date", { ascending: false }).order("time", { ascending: false });
    setAppointments(apps || []);
    const { data: pts } = await supabase.from("patients").select("*");
    setPatients(pts || []);
    const { data: atts } = await supabase.from("attendances").select("patient_id, total_value, appointment_id");
    setAttendances(atts || []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const handleCpfChange = useCallback(async (value: string) => {
    const masked = maskCPF(value);
    setForm((prev) => ({ ...prev, cpf: masked }));
    const raw = unmask(masked);
    if (raw.length === 11) {
      const { data: existing } = await supabase.from("patients").select("*").eq("cpf", raw).maybeSingle();
      if (existing) {
        setForm((prev) => ({
          ...prev,
          cpf: masked,
          patientName: existing.name,
          phone: existing.phone ? maskPhone(existing.phone) : prev.phone,
          birth_date: existing.birth_date ? isoToDateDisplay(existing.birth_date) : prev.birth_date,
        }));
        toast({ title: "Paciente encontrado! Dados preenchidos." });
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!form.patientName || !form.phone || !form.date || !form.time) {
      toast({ title: "Preencha nome, telefone, data e horário", variant: "destructive" });
      return;
    }
    if (!isValidPhone(form.phone)) {
      toast({ title: "Telefone inválido (deve ter 11 números)", variant: "destructive" });
      return;
    }
    if (form.cpf && !isValidCPF(form.cpf)) {
      toast({ title: "CPF inválido (deve ter 11 números)", variant: "destructive" });
      return;
    }
    const isoDate = dateDisplayToISO(form.date);
    if (!isoDate) {
      toast({ title: "Data inválida. Use o formato dd/mm/aaaa", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const rawPhone = unmask(form.phone);

    const { data: newApp } = await supabase.from("appointments").insert({
      patient_id: null,
      patient_name: form.patientName,
      phone: rawPhone,
      date: isoDate,
      time: form.time,
      reason: form.reason,
      status: "agendado",
    }).select("id").single();

    if (newApp && form.totalValue) {
      const rawCpf = unmask(form.cpf);
      let pId = null;
      if (rawCpf && rawCpf.length === 11) {
        const { data: existing } = await supabase.from("patients").select("id").eq("cpf", rawCpf).maybeSingle();
        if (existing) pId = existing.id;
      }

      if (pId) {
        await supabase.from("attendances").insert({
          appointment_id: newApp.id,
          patient_id: pId,
          date: isoDate,
          time: form.time,
          total_value: parseCurrency(form.totalValue),
          procedures: [],
        });
      }
    }

    toast({ title: "Agendamento criado" });
    setForm({ patientName: "", phone: "", date: "", time: "", reason: "", cpf: "", birth_date: "", totalValue: "" });
    setOpen(false);
    setSubmitting(false);
    reload();
  };

  const openStartModal = (a: Appointment) => {
    setStartAppointment(a);
    let p = patients.find((pt) => pt.id === a.patient_id);
    if (!p && a.phone) {
      const rawPhone = unmask(a.phone);
      p = patients.find((pt) => pt.phone === rawPhone);
    }
    setPatientData({
      name: p?.name || a.patient_name,
      phone: p?.phone ? maskPhone(p.phone) : (a.phone ? maskPhone(a.phone) : ""),
      cpf: p?.cpf ? maskCPF(p.cpf) : "",
      city: p?.city || "",
      state: p?.state || "",
      street: p?.street || "",
      cep: p?.cep ? maskCEP(p.cep) : "",
      number: p?.number || "",
      birth_date: p?.birth_date ? isoToDateDisplay(p.birth_date) : "",
    });
    setConfirmDate(isoToDateDisplay(a.date));
    setConfirmTime(a.time);
    const val = getAttendanceValue(a);
    setConfirmValue(val !== null && val !== undefined ? val.toString() : "");
    setStartOpen(true);
  };

  const handleConfirmCpfChange = async (value: string) => {
    const masked = maskCPF(value);
    setPatientData((prev) => ({ ...prev, cpf: masked }));
    const raw = unmask(masked);
    if (raw.length === 11) {
      setConfirmCpfSearching(true);
      const { data: existing } = await supabase.from("patients").select("*").eq("cpf", raw).maybeSingle();
      if (existing) {
        setPatientData({
          cpf: masked,
          name: existing.name,
          phone: existing.phone || "",
          birth_date: existing.birth_date ? isoToDateDisplay(existing.birth_date) : "",
          cep: existing.cep || "",
          state: existing.state || "",
          city: existing.city || "",
          street: existing.street || "",
          number: existing.number || "",
        });
        toast({ title: "Paciente encontrado! Dados preenchidos." });
      }
      setConfirmCpfSearching(false);
    }
  };

  const handleCepChange = async (value: string) => {
    const masked = maskCEP(value);
    setPatientData((prev) => ({ ...prev, cep: masked }));
    const raw = unmask(masked);
    if (raw.length === 8) {
      const addr = await fetchAddressByCEP(raw);
      if (addr) {
        setPatientData((prev) => ({ ...prev, state: addr.state, city: addr.city, street: addr.street }));
      }
    }
  };

  const handleStartSubmit = async () => {
    if (!startAppointment) return;

    if (!patientData.name) {
      toast({ title: "Preencha o nome do paciente", variant: "destructive" }); return;
    }

    const rawCpf = unmask(patientData.cpf);
    if (rawCpf && !isValidCPF(patientData.cpf)) {
      toast({ title: "CPF inválido", variant: "destructive" }); return;
    }
    if (patientData.cep && !isValidCEP(patientData.cep)) {
      toast({ title: "CEP inválido (deve ter 8 números)", variant: "destructive" }); return;
    }

    setStartSubmitting(true);

    const patientPayload = {
      name: patientData.name,
      phone: unmask(patientData.phone),
      cpf: rawCpf || "N/A-" + Date.now(),
      city: patientData.city,
      state: patientData.state,
      street: patientData.street,
      cep: unmask(patientData.cep),
      number: patientData.number,
      birth_date: patientData.birth_date ? (dateDisplayToISO(patientData.birth_date) || null) : null,
    };

    let targetPatientId: string | null = null;

    if (rawCpf && rawCpf.length === 11) {
      const { data: existingPatient } = await supabase.from("patients").select("id").eq("cpf", rawCpf).maybeSingle();
      if (existingPatient) {
        targetPatientId = existingPatient.id;
        await supabase.from("patients").update(patientPayload).eq("id", existingPatient.id);
      } else {
        const { data: newP } = await supabase.from("patients").insert(patientPayload).select("id").single();
        if (newP) targetPatientId = newP.id;
      }
    } else if (startAppointment.patient_id) {
      targetPatientId = startAppointment.patient_id;
      await supabase.from("patients").update(patientPayload).eq("id", startAppointment.patient_id);
    } else {
      const { data: newP } = await supabase.from("patients").insert(patientPayload).select("id").single();
      if (newP) targetPatientId = newP.id;
    }

    const isoConfirmDate = dateDisplayToISO(confirmDate);
    await supabase.from("appointments").update({
      patient_id: targetPatientId,
      patient_name: patientData.name,
      date: isoConfirmDate || confirmDate,
      time: confirmTime,
      status: "confirmado",
    }).eq("id", startAppointment.id);

    if (targetPatientId) {
      const val = parseCurrency(confirmValue);
      const { data: existingAtt } = await supabase.from("attendances").select("id").eq("appointment_id", startAppointment.id).maybeSingle();

      if (existingAtt) {
        await supabase.from("attendances").update({
          total_value: val,
        }).eq("id", existingAtt.id);
      } else {
        await supabase.from("attendances").insert({
          appointment_id: startAppointment.id,
          patient_id: targetPatientId,
          date: isoConfirmDate || startAppointment.date,
          time: confirmTime,
          total_value: val,
          procedures: [],
        });
      }
    }

    toast({ title: "Dados confirmados com sucesso" });
    setStartOpen(false);
    setStartSubmitting(false);
    reload();
  };

  const handleStartAtendimento = async (a: Appointment) => {
    await supabase.from("appointments").update({ status: "em_atendimento" }).eq("id", a.id);
    toast({ title: "Atendimento iniciado" });
    reload();
  };

  const openFinishModal = (a: Appointment) => {
    setFinishAppointment(a);
    setProcedures([{ name: "" }]);
    const val = getAttendanceValue(a);
    setTotalValue(val !== null && val !== undefined ? formatCurrency(val) : "");
    setNotes("");
    setFinishOpen(true);
  };

  const handleFinishSubmit = async () => {
    if (!finishAppointment) return;
    const validProcs = procedures.filter((p) => p.name.trim());
    if (validProcs.length === 0) {
      toast({ title: "Adicione ao menos um procedimento", variant: "destructive" }); return;
    }

    setFinishSubmitting(true);
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);

    await supabase.from("attendances").insert({
      patient_id: finishAppointment.patient_id,
      appointment_id: finishAppointment.id,
      date, time,
      procedures: validProcs,
      total_value: parseCurrency(totalValue),
      notes,
    });

    await supabase.from("medical_records").insert({
      patient_id: finishAppointment.patient_id,
      date: now.toISOString(),
      procedures: validProcs.map((p) => p.name).join(", "),
      notes,
      professional: "Dr. Lenon Uteich",
    });

    await supabase.from("appointments").update({ status: "concluido" }).eq("id", finishAppointment.id);
    toast({ title: "Atendimento finalizado e prontuário atualizado" });
    setFinishOpen(false);
    setFinishSubmitting(false);
    reload();
  };

  const addProcedure = () => setProcedures([...procedures, { name: "" }]);
  const removeProcedure = (i: number) => setProcedures(procedures.filter((_, idx) => idx !== i));
  const updateProcName = (i: number, val: string) => {
    const copy = [...procedures];
    copy[i] = { name: val };
    setProcedures(copy);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from("appointments").delete().eq("id", deleteId);
    toast({ title: "Agendamento removido" });
    setDeleteId(null);
    setDeleting(false);
    reload();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    reload();
  };

  const getWhatsAppLink = (a: Appointment) => {
    if (!a.phone) return null;
    const raw = unmask(a.phone);
    const [y, m, d] = a.date.split("-");
    const dataFormatada = `${d}/${m}/${y}`;
    const nome = a.patient_name.split(" ")[0];

    let message: string;
    switch (a.status) {
      case "agendado":
        message = `Olá ${nome}! Passando para confirmar sua consulta na *Uteich Odontologia* no dia *${dataFormatada}* às *${a.time}*. Você confirma sua presença?`;
        break;
      case "confirmado":
        message = `Olá ${nome}! Lembrando que sua consulta na *Uteich Odontologia* está confirmada para *${dataFormatada}* às *${a.time}*. Até lá!`;
        break;
      case "cancelado":
        message = `Olá ${nome}, notamos que sua consulta do dia *${dataFormatada}* às *${a.time}* foi cancelada. Gostaríamos de remarcar para você! Qual seria um bom horário?`;
        break;
      case "concluido":
        message = `Olá ${nome}! Agradecemos pela sua visita à *Uteich Odontologia*! Esperamos que tenha ficado satisfeito(a). Qualquer dúvida, estamos à disposição.`;
        break;
      default:
        message = `Olá ${nome}! Temos um agendamento em seu nome na *Uteich Odontologia* para o dia *${dataFormatada}* às *${a.time}*. Entre em contato conosco se tiver qualquer dúvida!`;
    }

    return `https://wa.me/55${raw}?text=${encodeURIComponent(message)}`;
  };

  const getAttendanceValue = (a: Appointment) => {
    const att = attendances.find((at) => at.appointment_id === a.id);
    if (att) return att.total_value;
    if (!a.patient_id) return null;
    const fallback = attendances.find((at) => at.patient_id === a.patient_id && !at.appointment_id);
    return fallback?.total_value;
  };

  const exportCSV = () => {
    const headers = ["Data", "Hora", "Valor", "Motivo", "CPF", "Nome", "Telefone", "CEP", "Estado", "Cidade", "Rua", "Número"];
    const rows = filtered.map((a) => {
      let p = patients.find((pt) => pt.id === a.patient_id);
      if (!p && a.phone) {
        const rawPhone = unmask(a.phone);
        p = patients.find((pt) => pt.phone && unmask(pt.phone) === rawPhone);
      }
      const val = getAttendanceValue(a);
      return [
        new Date(a.date + "T12:00:00").toLocaleDateString("pt-BR"),
        a.time,
        formatCurrency(val),
        a.reason || "",
        p?.cpf ? maskCPF(p.cpf) : "",
        a.patient_name || p?.name || "",
        a.phone ? maskPhone(a.phone) : (p?.phone ? maskPhone(p.phone) : ""),
        p?.cep ? maskCEP(p.cep) : "",
        p?.state || "",
        p?.city || "",
        p?.street || "",
        p?.number || "",
      ].map(v => `"${v}"`).join(";");
    });
    const csv = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agenda_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = appointments.filter((a) => {
    let p = patients.find((pt) => pt.id === a.patient_id);
    if (!p && a.phone) {
      const rawPhone = unmask(a.phone);
      p = patients.find((pt) => pt.phone === rawPhone);
    }
    if (filterName && !a.patient_name.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterCpf) {
      const rawFilter = unmask(filterCpf);
      const patientCpf = p?.cpf || "";
      if (!patientCpf.includes(rawFilter)) return false;
    }
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    const isoFrom = dateDisplayToISO(filterDateFrom);
    const isoTo = dateDisplayToISO(filterDateTo);
    if (isoFrom && a.date < isoFrom) return false;
    if (isoTo && a.date > isoTo) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="text-xl">Agenda</CardTitle>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Exportar</span> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-1" /> Filtros
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-none"><Plus className="w-4 h-4 mr-1" /> Novo Agendamento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <Label>CPF (opcional — busca automática)</Label>
                  <Input value={form.cpf} onChange={(e) => handleCpfChange(e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div><Label>Nome do Paciente *</Label><Input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} /></div>
                <div><Label>Telefone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(51) 99999-9999" /></div>
                <div><Label>Data de Nascimento</Label><Input value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: maskDate(e.target.value) })} placeholder="dd/mm/aaaa" maxLength={10} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Data do Agendamento *</Label><Input value={form.date} onChange={(e) => setForm({ ...form, date: maskDate(e.target.value) })} placeholder="dd/mm/aaaa" maxLength={10} /></div>
                  <div><Label>Horário *</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                </div>
                <div><Label>Motivo</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ex: Limpeza, Avaliação..." /></div>
                <div><Label>Valor Total</Label><Input value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: maskCurrency(e.target.value) })} placeholder="R$ 0,00" /></div>

                <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Agendar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {showFilters && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-lg border bg-muted/30">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input placeholder="Buscar por nome" value={filterName} onChange={(e) => setFilterName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">CPF</Label>
              <Input placeholder="Buscar por CPF" value={filterCpf} onChange={(e) => setFilterCpf(maskCPF(e.target.value))} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data Início</Label>
              <Input value={filterDateFrom} onChange={(e) => setFilterDateFrom(maskDate(e.target.value))} placeholder="dd/mm/aaaa" maxLength={10} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Data Fim</Label>
              <Input value={filterDateTo} onChange={(e) => setFilterDateTo(maskDate(e.target.value))} placeholder="dd/mm/aaaa" maxLength={10} className="h-8 text-sm" />
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setFilterName(""); setFilterCpf(""); setFilterStatus("all"); setFilterDateFrom(todayDisplay); setFilterDateTo(nextWeekDisplay); }}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}

      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum agendamento</p>
              )}
              {filtered.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{a.patient_name}</span>
                    {a.status !== "concluido" ? (
                      <Select value={a.status} onValueChange={(v) => handleStatusChange(a.id, v)}>
                        <SelectTrigger className="h-7 w-[130px] text-xs">
                          <Badge className={statusColors[a.status] || ""}>{statusLabels[a.status] || a.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={statusColors[a.status] || ""}>{statusLabels[a.status] || a.status}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.date + "T12:00:00").toLocaleDateString("pt-BR")} às {a.time}
                    </div>
                    {a.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {maskPhone(a.phone)}
                      </div>
                    )}
                    {a.reason && <div>Motivo: {a.reason}</div>}
                    {getAttendanceValue(a) !== null && getAttendanceValue(a) !== undefined && (
                      <div className="font-medium text-green-700">
                        Valor: {formatCurrency(getAttendanceValue(a))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {a.phone && (
                      <a href={getWhatsAppLink(a)!} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700">
                          <FaWhatsapp className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => openStartModal(a)} className="h-8 w-8">
                            <ClipboardCheck className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Confirmar Dados do paciente</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {a.status === "confirmado" && (
                      <Button variant="default" size="sm" onClick={() => handleStartAtendimento(a)} className="text-xs">
                        <Play className="w-3 h-3 mr-1" /> Iniciar
                      </Button>
                    )}
                    {a.status === "em_atendimento" && (
                      <Button variant="default" size="sm" onClick={() => openFinishModal(a)} className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" /> Finalizar
                      </Button>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setDeleteId(a.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir agendamento</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum agendamento</TableCell></TableRow>
                )}
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap">{new Date(a.date + "T12:00:00").toLocaleDateString("pt-BR")} {a.time}</TableCell>
                    <TableCell className="font-medium">{a.patient_name}</TableCell>
                    <TableCell>{a.phone ? maskPhone(a.phone) : ""}</TableCell>
                    <TableCell>{a.reason}</TableCell>
                    <TableCell>
                      {getAttendanceValue(a) !== null && getAttendanceValue(a) !== undefined ? (
                        <span className="font-medium text-green-700">
                          {formatCurrency(getAttendanceValue(a))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.status !== "concluido" ? (
                        <Select value={a.status} onValueChange={(v) => handleStatusChange(a.id, v)}>
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <Badge className={statusColors[a.status] || ""}>{statusLabels[a.status] || a.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agendado">Agendado</SelectItem>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={statusColors[a.status] || ""}>{statusLabels[a.status] || a.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        {a.phone && (
                          <a href={getWhatsAppLink(a)!} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" title="WhatsApp">
                              <FaWhatsapp className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => openStartModal(a)} className="h-8 w-8">
                                <ClipboardCheck className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Confirmar Dados do paciente</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {a.status === "confirmado" && (
                          <Button variant="default" size="sm" onClick={() => handleStartAtendimento(a)} className="text-xs">
                            <Play className="w-3 h-3 mr-1" /> Iniciar Atendimento
                          </Button>
                        )}
                        {a.status === "em_atendimento" && (
                          <Button variant="default" size="sm" onClick={() => openFinishModal(a)} className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Finalizar Atendimento
                          </Button>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => setDeleteId(a.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir agendamento</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader><DialogTitle>Confirmar Dados — {startAppointment?.patient_name}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <p className="text-sm text-muted-foreground">Confirme e complete os dados do paciente:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Data do Agendamento</Label><Input value={confirmDate} onChange={(e) => setConfirmDate(maskDate(e.target.value))} placeholder="dd/mm/aaaa" maxLength={10} /></div>
              <div><Label>Horário</Label><Input type="time" value={confirmTime} onChange={(e) => setConfirmTime(e.target.value)} /></div>
            </div>
            <div>
              <Label>CPF</Label>
              <div className="relative">
                <Input value={maskCPF(patientData.cpf)} onChange={(e) => handleConfirmCpfChange(e.target.value)} placeholder="000.000.000-00" />
                {confirmCpfSearching && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-2.5 text-muted-foreground" />}
              </div>
            </div>
            <div><Label>Nome</Label><Input value={patientData.name} onChange={(e) => setPatientData({ ...patientData, name: e.target.value })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Telefone</Label><Input value={maskPhone(patientData.phone)} onChange={(e) => setPatientData({ ...patientData, phone: maskPhone(e.target.value) })} /></div>
              <div><Label>Data de Nascimento</Label><Input value={patientData.birth_date} onChange={(e) => setPatientData({ ...patientData, birth_date: maskDate(e.target.value) })} placeholder="dd/mm/aaaa" maxLength={10} /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><Label>CEP</Label><Input value={maskCEP(patientData.cep)} onChange={(e) => handleCepChange(e.target.value)} placeholder="00000-000" /></div>
              <div><Label>Estado</Label><Input value={patientData.state} onChange={(e) => setPatientData({ ...patientData, state: e.target.value })} /></div>
              <div className="col-span-2 sm:col-span-1"><Label>Cidade</Label><Input value={patientData.city} onChange={(e) => setPatientData({ ...patientData, city: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Label>Rua</Label><Input value={patientData.street} onChange={(e) => setPatientData({ ...patientData, street: e.target.value })} /></div>
              <div><Label>Número</Label><Input value={patientData.number} onChange={(e) => setPatientData({ ...patientData, number: e.target.value })} /></div>
            </div>
            <div><Label>Valor Total</Label><Input value={confirmValue} onChange={(e) => setConfirmValue(maskCurrency(e.target.value))} placeholder="R$ 0,00" /></div>

            <Button onClick={handleStartSubmit} disabled={startSubmitting} className="mt-2">
              {startSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Dados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader><DialogTitle>Finalizar Atendimento — {finishAppointment?.patient_name}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Procedimentos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProcedure}>+ Adicionar</Button>
              </div>
              <div className="space-y-2">
                {procedures.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Procedimento" value={p.name} onChange={(e) => updateProcName(i, e.target.value)} className="flex-1" />
                    {procedures.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeProcedure(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Valor Total</Label><Input value={totalValue} onChange={(e) => setTotalValue(maskCurrency(e.target.value))} placeholder="R$ 0,00" /></div>
            <div><Label>Observações</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o atendimento..." /></div>
            <Button onClick={handleFinishSubmit} disabled={finishSubmitting} className="mt-2">
              {finishSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Finalizar Atendimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
