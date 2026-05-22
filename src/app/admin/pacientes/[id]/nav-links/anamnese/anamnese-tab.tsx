import AnamneseForm from "./components/anamnese-form";
import { AnamneseTabProps } from "@/src/types/dashboard/anamnese";

export default function AnamneseTab({ patientId, initialAnamnese }: AnamneseTabProps) {
    return <AnamneseForm patientId={patientId} initialAnamnese={initialAnamnese ?? null} />;
}
