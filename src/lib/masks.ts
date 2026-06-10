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
    return value
        .replace(/\D/g, "")
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

/** Converte telefone para formato internacional WhatsApp (+55) */
export function phoneToWhatsapp(phoneStr: string): string {
    const clean = rawPhone(phoneStr);
    if (clean.length === 11 || clean.length === 10) {
        return "55" + clean;
    }
    return clean;
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
