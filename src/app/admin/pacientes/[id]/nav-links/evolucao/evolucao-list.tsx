import { EvolucaoListProps } from "@/src/types/dashboard/pacientes";
import EvolucaoListClient from "./components/evolucao-list-client";
import { getHistoricoPaciente } from "@/src/services/historico";

export default async function EvolucaoList({ initialItems, patientId }: EvolucaoListProps) {
    const items = initialItems ?? (await getHistoricoPaciente(patientId)) ?? [];
    return <EvolucaoListClient initialItems={items} patientId={patientId} />;
}
