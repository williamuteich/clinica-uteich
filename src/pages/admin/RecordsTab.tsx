import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { maskCPF, maskPhone } from "@/lib/masks";

interface Patient { id: string; name: string; cpf: string; phone: string | null; }

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
  date: string;
  time?: string;
  title: string;
  description: string | null;
  status?: string;
  professional?: string;
}

export function RecordsTab() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    setLoadingPatients(true);
    supabase.from("patients").select("id, name, cpf, phone").then(({ data }) => {
      setPatients(data || []);
      setLoadingPatients(false);
    });
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setLoadingRecords(true);
      Promise.all([
        supabase.from("medical_records").select("*").eq("patient_id", selectedPatient),
        supabase.from("appointments").select("*").eq("patient_id", selectedPatient)
      ]).then(([recordsRes, appsRes]) => {
        const unified: UnifiedRecord[] = [];

        (recordsRes.data || []).forEach((r: MedicalRecord) => {
          unified.push({
            id: r.id,
            type: 'medical_record',
            date: r.date,
            title: r.procedures,
            description: r.notes,
            professional: r.professional
          });
        });

        (appsRes.data || []).forEach((a: Appointment) => {
          unified.push({
            id: a.id,
            type: 'appointment',
            date: a.date,
            time: a.time,
            title: `Agendamento: ${a.reason || "Sem motivo"}`,
            description: `Status: ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}`,
            status: a.status
          });
        });

        unified.sort((a, b) => {
          const dateA = a.type === 'appointment' ? `${a.date}T${a.time}` : a.date;
          const dateB = b.type === 'appointment' ? `${b.date}T${b.time}` : b.date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setRecords(unified);
        setLoadingRecords(false);
      });
    } else {
      setRecords([]);
    }
  }, [selectedPatient]);

  const patient = patients.find((p) => p.id === selectedPatient);
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Prontuário Eletrônico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loadingPatients ? (
            <Skeleton className="h-10 max-w-md" />
          ) : (
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {filteredPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} — {maskCPF(p.cpf)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {patient && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paciente: {patient.name}</CardTitle>
            <p className="text-sm text-muted-foreground">CPF: {maskCPF(patient.cpf)} | Tel: {patient.phone ? maskPhone(patient.phone) : "—"}</p>
          </CardHeader>
          <CardContent>
            {loadingRecords ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <FileText className="w-8 h-8" />
                <p>Nenhum registro no prontuário.</p>
                <p className="text-xs">Os atendimentos realizados aparecerão aqui automaticamente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => {
                  const isApp = r.type === 'appointment';
                  const dateObj = new Date(isApp ? `${r.date}T12:00:00` : r.date);
                  const dateStr = dateObj.toLocaleDateString("pt-BR");
                  const timeStr = isApp ? r.time : dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

                  const statusColors: Record<string, string> = {
                    agendado: "bg-blue-100 text-blue-700",
                    confirmado: "bg-green-100 text-green-700",
                    em_atendimento: "bg-orange-100 text-orange-700",
                    concluido: "bg-gray-100 text-gray-700",
                    cancelado: "bg-red-100 text-red-700",
                  };

                  return (
                    <div key={r.id} className={`border rounded-lg p-4 space-y-1 ${isApp ? 'bg-muted/10' : 'bg-primary/5 border-primary/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{dateStr} {timeStr ? `às ${timeStr}` : ''}</span>
                        {r.professional ? (
                          <span className="text-xs text-muted-foreground">{r.professional}</span>
                        ) : r.status ? (
                          <Badge variant="outline" className={`text-[10px] h-5 ${statusColors[r.status] || ""}`}>
                            {r.status.toUpperCase()}
                          </Badge>
                        ) : null}
                      </div>
                      <p className={`text-sm font-medium ${isApp ? 'text-foreground' : 'text-primary'}`}>{r.title}</p>
                      {r.description && <p className="text-sm text-muted-foreground italic">{r.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
