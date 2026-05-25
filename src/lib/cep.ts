
export interface CepData {
    uf: string;
    localidade: string;
    logradouro: string;
    bairro: string;
    erro?: boolean;
}

export async function fetchCep(cep: string): Promise<CepData | null> {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return null;
    try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data: CepData = await res.json();
        return data.erro ? null : data;
    } catch {
        return null;
    }
}
