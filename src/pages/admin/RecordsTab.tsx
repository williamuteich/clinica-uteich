import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { maskCPF, maskPhone } from "@/lib/masks";

interface Patient { id: string; name: string; cpf: string; phone: string | null; }
interface MedicalRecord { id: string; patient_id: string; date: string; procedures: string; notes: string | null; professional: string; }

export function RecordsTab() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
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
      supabase.from("medical_records").select("*").eq("patient_id", selectedPatient).order("date", { ascending: false })
        .then(({ data }) => {
          setRecords(data || []);
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
                {records.map((r) => (
                  <div key={r.id} className="border rounded-lg p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                      <span className="text-xs text-muted-foreground">{r.professional}</span>
                    </div>
                    <p className="text-sm font-medium text-primary">{r.procedures}</p>
                    {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
