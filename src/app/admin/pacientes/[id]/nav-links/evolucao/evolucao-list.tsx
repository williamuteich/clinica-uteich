import { getHistoricoPaciente } from "@/src/services/pacientes";
import { EvolucaoListProps } from "@/src/types/dashboard/pacientes";
import EvolucaoListClient from "./components/evolucao-list-client";

export default async function EvolucaoList({ initialItems, patientId }: EvolucaoListProps) {
    const items = initialItems ?? (await getHistoricoPaciente(patientId)) ?? [];
    return <EvolucaoListClient initialItems={items} patientId={patientId} />;
}
