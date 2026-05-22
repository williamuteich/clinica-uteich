import OdontogramaClient from "./odontograma-client";
import { IOdontogram } from "@/src/types/dashboard/odontograma";

export default function OdontogramaTab({ patientId, initialOdontogram }: { patientId: string, initialOdontogram: IOdontogram | null }) {
    return <OdontogramaClient patientId={patientId} initialOdontogram={initialOdontogram} />;
}
