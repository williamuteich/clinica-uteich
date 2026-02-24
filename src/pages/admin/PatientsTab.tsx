import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, Loader2, FileText, Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { maskCPF, maskPhone, maskCEP, maskDate, dateDisplayToISO, isoToDateDisplay, unmask, isValidCPF, isValidPhone, isValidCEP, fetchAddressByCEP, formatCurrency } from "@/lib/masks";

interface Patient {
  id: string;
  cpf: string;
  name: string;
  birth_date: string | null;
  phone: string | null;
  cep: string | null;
  state: string | null;
  city: string | null;
  street: string | null;
  number: string | null;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  date: string;
  procedures: string;
  notes: string | null;
  professional: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  reason: string | null;
  status: string;
}

interface UnifiedRecord {
  id: string;
  type: 'appointment' | 'medical_record';
  date: string; // ISO or YYYY-MM-DD
  time?: string;
  title: string;
  description: string | null;
  status?: string;
  professional?: string;
  value?: number;
}

interface Attendance {
  id: string;
  patient_id: string;
  appointment_id?: string;
  date: string;
  total_value: number;
}

const emptyForm = { cpf: "", name: "", birth_date: "", phone: "", cep: "", state: "", city: "", street: "", number: "" };

export function PatientsTab() {
  const isMobile = useIsMobile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [recordsOpen, setRecordsOpen] = useState(false);
  const [recordsPatient, setRecordsPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const reload = async () => {
    setLoading(true);
    const { data } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
    setPatients(data || []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const filtered = patients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search)
  );

  const getWhatsAppLink = (phone: string) => {
    const raw = unmask(phone);
    return `https://wa.me/55${raw}`;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.cpf) {
      toast({ title: "Preencha CPF e Nome", variant: "destructive" });
      return;
    }
    if (!isValidCPF(form.cpf)) {
      toast({ title: "CPF inválido (deve ter 11 números)", variant: "destructive" });
      return;
    }
    if (form.phone && !isValidPhone(form.phone)) {
      toast({ title: "Telefone inválido (deve ter 11 números)", variant: "destructive" });
      return;
    }
    if (form.cep && !isValidCEP(form.cep)) {
      toast({ title: "CEP inválido (deve ter 8 números)", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const rawCpf = unmask(form.cpf);
    const isoDate = form.birth_date ? dateDisplayToISO(form.birth_date) : "";
    const payload = { ...form, cpf: rawCpf, phone: form.phone ? unmask(form.phone) : "", cep: form.cep ? unmask(form.cep) : "", birth_date: isoDate || null };
    if (editId) {
      await supabase.from("patients").update(payload).eq("id", editId);
      toast({ title: "Paciente atualizado" });
    } else {
      const { data: existing } = await supabase.from("patients").select("id").eq("cpf", payload.cpf).maybeSingle();
      if (existing) {
        toast({ title: "CPF já cadastrado na base de dados", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      await supabase.from("patients").insert(payload);
      toast({ title: "Paciente cadastrado" });
    }
    setForm(emptyForm);
    setEditId(null);
    setOpen(false);
    setSubmitting(false);
    reload();
  };

  const handleEdit = (p: Patient) => {
    setForm({ cpf: maskCPF(p.cpf), name: p.name, birth_date: p.birth_date ? isoToDateDisplay(p.birth_date) : "", phone: p.phone ? maskPhone(p.phone) : "", cep: p.cep ? maskCEP(p.cep) : "", state: p.state || "", city: p.city || "", street: p.street || "", number: p.number || "" });
    setEditId(p.id);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    // Delete dependent records first to avoid foreign key conflicts
    await Promise.all([
      supabase.from("medical_records").delete().eq("patient_id", deleteId),
      supabase.from("attendances").delete().eq("patient_id", deleteId),
      supabase.from("appointments").delete().eq("patient_id", deleteId),
    ]);

    await supabase.from("patients").delete().eq("id", deleteId);
    toast({ title: "Paciente removido" });
    setDeleteId(null);
    setDeleting(false);
    reload();
  };

  const openRecordsModal = async (p: Patient) => {
    setRecordsPatient(p);
    setRecordsOpen(true);
    setLoadingRecords(true);

    const [recordsRes, appsRes, attRes] = await Promise.all([
      supabase.from("medical_records").select("*").eq("patient_id", p.id),
      supabase.from("appointments").select("*")
        .or(`patient_id.eq.${p.id},phone.eq.${p.phone || 'none'}`)
        .neq("status", "em_atendimento"),
      supabase.from("attendances").select("*").eq("patient_id", p.id)
    ]);

    const unified: UnifiedRecord[] = [];
    const attendances: Attendance[] = attRes.data || [];
    const medicalRecords = recordsRes.data || [];
    const allAppointments = appsRes.data || [];

    const appointments = allAppointments.filter(a =>
      a.patient_id === p.id || (!a.patient_id && a.phone === p.phone)
    );

    medicalRecords.forEach((r: MedicalRecord) => {
      const att = attendances.find(a => !a.appointment_id && a.date === r.date.split('T')[0]);
      unified.push({
        id: r.id,
        type: 'medical_record',
        date: r.date,
        title: r.procedures,
        description: r.notes,
        professional: r.professional,
        value: att?.total_value
      });
    });

    appointments.forEach((a: Appointment) => {
      const att = attendances.find(at => at.appointment_id === a.id);
      unified.push({
        id: a.id,
        type: 'appointment',
        date: a.date,
        time: a.time,
        title: a.reason || "Consulta",
        description: null,
        status: a.status,
        value: att?.total_value || (attRes.data?.find(at => at.date === a.date && at.time === a.time)?.total_value)
      });
    });

    const parseDate = (r: UnifiedRecord) => {
      if (r.type === 'appointment') {
        return new Date(`${r.date}T${r.time || '12:00:00'}`);
      }
      return new Date(r.date);
    };

    unified.sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime());

    setRecords(unified);
    setLoadingRecords(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-xl">Pacientes</CardTitle>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo Paciente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>CPF *</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" /></div>
                <div><Label>Data de Nascimento</Label><Input value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: maskDate(e.target.value) })} placeholder="dd/mm/aaaa" maxLength={10} /></div>
              </div>
              <div><Label>Nome Completo *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(51) 99999-9999" /></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><Label>CEP</Label><Input value={form.cep} onChange={async (e) => { const masked = maskCEP(e.target.value); setForm(f => ({ ...f, cep: masked })); if (unmask(masked).length === 8) { const addr = await fetchAddressByCEP(masked); if (addr) { setForm(f => ({ ...f, state: addr.state, city: addr.city, street: addr.street })); toast({ title: "Endereço encontrado pelo CEP" }); } else { toast({ title: "CEP não encontrado, preencha manualmente", variant: "destructive" }); } } }} placeholder="00000-000" /></div>
                <div><Label>Estado</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                <div className="col-span-2 sm:col-span-1"><Label>Cidade</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><Label>Rua</Label><Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></div>
                <div><Label>Número</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editId ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
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
                <p className="text-center text-muted-foreground py-8">Nenhum paciente encontrado</p>
              )}
              {filtered.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{p.name}</span>
                    <div className="flex gap-1">
                      {p.phone && (
                        <a href={getWhatsAppLink(p.phone)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700">
                            <FaWhatsapp className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openRecordsModal(p)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>CPF: {maskCPF(p.cpf)}</div>
                    {p.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {maskPhone(p.phone)}
                      </div>
                    )}
                    {(p.city || p.state) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.city}{p.state ? `/${p.state}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Prontuário</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum paciente encontrado</TableCell></TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{maskCPF(p.cpf)}</TableCell>
                    <TableCell>{p.phone ? maskPhone(p.phone) : ""}</TableCell>
                    <TableCell>{p.city}{p.state ? `/${p.state}` : ""}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openRecordsModal(p)}>
                        <FileText className="w-4 h-4 mr-1" /> Ver
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.phone && (
                          <a href={getWhatsAppLink(p.phone)} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                              <FaWhatsapp className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>

      <Dialog open={recordsOpen} onOpenChange={setRecordsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Prontuário — {recordsPatient?.name}</DialogTitle>
          </DialogHeader>
          {recordsPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm border rounded-lg p-4 bg-muted/30">
                <div><span className="font-medium text-muted-foreground">Nome:</span> {recordsPatient.name}</div>
                <div><span className="font-medium text-muted-foreground">CPF:</span> {maskCPF(recordsPatient.cpf)}</div>
                <div><span className="font-medium text-muted-foreground">Data Nasc.:</span> {recordsPatient.birth_date ? new Date(recordsPatient.birth_date + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</div>
                <div><span className="font-medium text-muted-foreground">Telefone:</span> {recordsPatient.phone ? maskPhone(recordsPatient.phone) : "—"}</div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-medium text-muted-foreground">Endereço:</span>{" "}
                  {[recordsPatient.street, recordsPatient.number, recordsPatient.city, recordsPatient.state].filter(Boolean).join(", ") || "—"}
                  {recordsPatient.cep ? ` — CEP: ${maskCEP(recordsPatient.cep)}` : ""}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3">Histórico de Atendimentos</h3>
                {loadingRecords ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8" />
                    <p>Nenhum registro no prontuário.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map((r) => {
                      const isApp = r.type === 'appointment';
                      let dateStr = "Data Inválida";
                      let timeStr = isApp ? r.time : "";

                      try {
                        let dateObj: Date;
                        if (isApp) {
                          const [y, m, d] = r.date.split('-');
                          dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                        } else {
                          dateObj = new Date(r.date);
                          if (!timeStr) {
                            timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                          }
                        }

                        if (!isNaN(dateObj.getTime())) {
                          dateStr = dateObj.toLocaleDateString("pt-BR");
                        }
                      } catch (e) {
                        console.error("Error parsing date:", r.date, e);
                      }

                      const statusLabels: Record<string, string> = {
                        agendado: "Agendado",
                        confirmado: "Confirmado",
                        concluido: "Concluído",
                        cancelado: "Cancelado",
                      };

                      return (
                        <div key={r.id} className="border-b border-dashed pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-muted-foreground">{dateStr} {timeStr ? `às ${timeStr}` : ''}</span>
                            {r.status && r.status !== 'concluido' && (
                              <Badge variant="outline" className="text-[10px] h-5 font-normal capitalize">{statusLabels[r.status] || r.status}</Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-medium flex-1 capitalize">{r.title.toLowerCase()}</p>
                            {r.value !== undefined && r.value !== null && r.value > 0 && (
                              <span className="text-sm border rounded px-1.5 py-0.5 bg-green-50 text-green-700 font-bold whitespace-nowrap">
                                {formatCurrency(r.value)}
                              </span>
                            )}
                          </div>
                          {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover este paciente? Esta ação não pode ser desfeita.</AlertDialogDescription>
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
    </Card>
  );
}