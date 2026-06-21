import { NextResponse } from "next/server";

export function checkBotKey(request: Request): boolean {
  if (!process.env.BOT_API_KEY) return false;
  const key = request.headers.get("x-bot-api-key");
  return key === process.env.BOT_API_KEY;
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export function getComparablePhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  const noCountry = clean.startsWith("55") ? clean.slice(2) : clean;
  if (noCountry.length === 11 && noCountry[2] === "9") {
    return noCountry.slice(0, 2) + noCountry.slice(3);
  }
  return noCountry;
}

export function comparePhones(phone1: string, phone2: string): boolean {
  const p1 = getComparablePhone(phone1);
  const p2 = getComparablePhone(phone2);
  return !!p1 && p1 === p2;
}

export function parseLocalTimezone(dateStr: string): string {
  if (
    typeof dateStr === "string" &&
    !dateStr.endsWith("Z") &&
    !dateStr.includes("+") &&
    !/-\d{2}:\d{2}$/.test(dateStr)
  ) {
    return `${dateStr}-03:00`;
  }
  return dateStr;
}

export function startOfTodayLocal(): Date {
  const now = new Date();
  const localISO = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10);
  return new Date(`${localISO}T00:00:00-03:00`);
}

export function cleanInputVal(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      return undefined;
    }
    return trimmed;
  }
  return value;
}
