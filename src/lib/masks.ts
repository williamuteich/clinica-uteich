/** Formata CPF: 000.000.000-00 */
export function maskCPF(value: string): string {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
}

/** Formata Telefone/WhatsApp: (51) 99999-9999 */
export function maskPhone(value: string): string {
    let clean = value.replace(/\D/g, "");
    if (clean.startsWith("55") && (clean.length === 12 || clean.length === 13)) {
        clean = clean.slice(2);
    }
    return clean
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}

/** Formata CEP: 00000-000 */
export function maskCEP(value: string): string {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{3})\d+?$/, "$1");
}

/** Extrai apenas os dígitos do CPF (usado para busca) */
export function rawCPF(value: string): string {
    return value.replace(/\D/g, "").slice(0, 11);
}

/** Extrai apenas os dígitos do telefone */
export function rawPhone(value: string): string {
    return value.replace(/\D/g, "");
}

/** Converte telefone para formato internacional WhatsApp (+55) sem o 9º dígito para compatibilidade */
export function phoneToWhatsapp(phoneStr: string): string {
    let clean = phoneStr.replace(/\D/g, "");

    // Se começar com 55 e for 12 ou 13 dígitos, tira o 55 temporariamente
    if (clean.startsWith("55") && (clean.length === 12 || clean.length === 13)) {
        clean = clean.slice(2);
    }

    // Se tiver 11 dígitos e o 3º dígito for 9 (celular com 9º dígito), removemos o 9º dígito
    if (clean.length === 11 && clean[2] === "9") {
        clean = clean.slice(0, 2) + clean.slice(3);
    }

    return "55" + clean;
}

/** Formata valor monetário: R$ 1.234,56 */
export function maskCurrency(value: string | number): string {
    const raw = String(value).replace(/\D/g, "");
    if (!raw) return "";
    const num = (parseInt(raw, 10) / 100).toFixed(2);
    return num.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Converte "1.234,56" de volta para float */
export function rawCurrency(masked: string): number {
    return parseFloat(masked.replace(/\./g, "").replace(",", ".")) || 0;
}
