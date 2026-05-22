import { Paciente } from "@/src/types/dashboard/pacientes";
import CadastroForm from "./components/cadastro-form";

export default function CadastroTab({ paciente }: { paciente: Paciente }) {
    return <CadastroForm paciente={paciente} />;
}
