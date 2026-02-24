export const maskCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const maskCEP = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
};

/** Formats as dd/mm/yyyy while typing */
export const maskDate = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

/** Converts dd/mm/yyyy → yyyy-mm-dd (for saving to Supabase) */
export const dateDisplayToISO = (display: string): string => {
  const [d, m, y] = display.split("/");
  if (!d || !m || !y || y.length < 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

/** Converts yyyy-mm-dd → dd/mm/yyyy (for displaying stored ISO dates) */
export const isoToDateDisplay = (iso: string): string => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export const unmask = (value: string): string => value.replace(/\D/g, "");

export const isValidCPF = (value: string): boolean => unmask(value).length === 11;
export const isValidPhone = (value: string): boolean => unmask(value).length === 11;
export const isValidCEP = (value: string): boolean => unmask(value).length === 8;

/** Validates a dd/mm/yyyy date string */
export const isValidDate = (display: string): boolean => {
  const iso = dateDisplayToISO(display);
  if (!iso) return false;
  const d = new Date(iso + "T12:00:00");
  return !isNaN(d.getTime());
};

export const fetchAddressByCEP = async (cep: string): Promise<{ state: string; city: string; street: string } | null> => {
  const raw = unmask(cep);
  if (raw.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return { state: data.uf || "", city: data.localidade || "", street: data.logradouro || "" };
  } catch {
    return null;
  }
};
