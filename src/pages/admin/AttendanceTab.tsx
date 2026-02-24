import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { maskCPF, maskPhone } from "@/lib/masks";

interface Patient { id: string; name: string; cpf: string; phone: string | null; city: string | null; state: string | null; }

interface Attendance {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  procedures: { name: string; value: number }[];
  total_value: number;
  notes: string | null;
}

export function AttendanceTab() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patientUpdate, setPatientUpdate] = useState({ phone: "", city: "", state: "" });
  const [procedures, setProcedures] = useState([{ name: "", value: 0 }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("patients").select("id, name, cpf, phone, city, state");
    setPatients(p || []);
    const { data: a } = await supabase.from("attendances").select("*").order("created_at", { ascending: false });
    setAttendances((a || []).map((att: any) => ({ ...att, procedures: att.procedures || [] })));
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    const p = patients.find((p) => p.id === selectedPatient);
    if (p) setPatientUpdate({ phone: p.phone || "", city: p.city || "", state: p.state || "" });
  }, [selectedPatient, patients]);

  const total = procedures.reduce((s, p) => s + (p.value || 0), 0);
  const patient = patients.find((p) => p.id === selectedPatient);

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast({ title: "Selecione um paciente", variant: "destructive" });
      return;
    }
    const validProcs = procedures.filter((p) => p.name.trim());
    if (validProcs.length === 0) {
      toast({ title: "Adicione ao menos um procedimento", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);

    await supabase.from("attendances").insert({
      patient_id: selectedPatient,
      date, time,
      procedures: validProcs,
      total_value: total,
      notes,
    });

    await supabase.from("patients").update({
      phone: patientUpdate.phone,
      city: patientUpdate.city,
      state: patientUpdate.state,
    }).eq("id", selectedPatient);

    await supabase.from("medical_records").insert({
      patient_id: selectedPatient,
      date: now.toISOString(),
      procedures: validProcs.map((p) => `${p.name} (R$ ${p.value.toFixed(2)})`).join(", "),
      notes,
      professional: "Dr. Lenon Uteich",
    });

    toast({ title: "Atendimento registrado e prontuário atualizado" });
    setSelectedPatient("");
    setProcedures([{ name: "", value: 0 }]);
    setNotes("");
    setOpen(false);
    setSubmitting(false);
    reload();
  };

  const addProcedure = () => setProcedures([...procedures, { name: "", value: 0 }]);
  const removeProcedure = (i: number) => setProcedures(procedures.filter((_, idx) => idx !== i));
  const updateProc = (i: number, field: "name" | "value", val: string | number) => {
    const copy = [...procedures];
    copy[i] = { ...copy[i], [field]: val };
    setProcedures(copy);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-xl">Atendimentos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo Atendimento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Atendimento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div>
                <Label>Paciente *</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — {maskCPF(p.cpf)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {patient && (
                <div className="bg-muted rounded-lg p-3 text-sm space-y-2">
                  <p className="font-medium">Dados do paciente (editáveis):</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label className="text-xs">Telefone</Label><Input className="h-8 text-xs" value={patientUpdate.phone} onChange={(e) => setPatientUpdate({ ...patientUpdate, phone: maskPhone(e.target.value) })} /></div>
                    <div><Label className="text-xs">Cidade</Label><Input className="h-8 text-xs" value={patientUpdate.city} onChange={(e) => setPatientUpdate({ ...patientUpdate, city: e.target.value })} /></div>
                    <div><Label className="text-xs">Estado</Label><Input className="h-8 text-xs" value={patientUpdate.state} onChange={(e) => setPatientUpdate({ ...patientUpdate, state: e.target.value })} /></div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Procedimentos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addProcedure}>+ Adicionar</Button>
                </div>
                <div className="space-y-2">
                  {procedures.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input placeholder="Procedimento" value={p.name} onChange={(e) => updateProc(i, "name", e.target.value)} className="flex-1" />
                      <Input type="number" placeholder="Valor" value={p.value || ""} onChange={(e) => updateProc(i, "value", parseFloat(e.target.value) || 0)} className="w-28" />
                      {procedures.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProcedure(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-right text-sm font-semibold mt-2">Total: R$ {total.toFixed(2)}</p>
              </div>

              <div><Label>Observações</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o atendimento..." /></div>

              <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground">
                Data/Hora serão registradas automaticamente pelo sistema.
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrar Atendimento
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Procedimentos</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum atendimento registrado</TableCell></TableRow>
                )}
                {attendances.map((a) => {
                  const p = patients.find((p) => p.id === a.patient_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap">{new Date(a.date + "T12:00:00").toLocaleDateString("pt-BR")} {a.time}</TableCell>
                      <TableCell className="font-medium">{p?.name || "—"}{p ? ` — ${maskCPF(p.cpf)}` : ""}</TableCell>
                      <TableCell className="text-sm">{a.procedures.map((pr: any) => pr.name).join(", ")}</TableCell>
                      <TableCell className="font-semibold">R$ {Number(a.total_value).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
