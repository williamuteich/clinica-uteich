import { getAgendamentos } from "@/src/services/pacientes";
import AgendamentosClient from "./agendamentos-client";

export default async function AgendamentosTab({ patientId }: { patientId: string }) {
    const response = await getAgendamentos({ patientId, page: 1, limit: 100 });
    return <AgendamentosClient patientId={patientId} initialAppointments={response?.agendamentos ?? []} />;
}
