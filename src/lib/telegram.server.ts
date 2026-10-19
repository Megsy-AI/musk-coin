// Server-only Telegram helpers (Bot API + Mini App initData verification).
export const CHANNEL_ID = "-1003736245644";
export const APP_NAME = "Musk Coin";

export function botToken(): string {
  const t = process.env["TELEGRAM_BOT_TOKEN"];
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return t;
}

export async function tg<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${json.description}`);
  return json.result;
}

export async function tgForm<T = any>(method: string, form: FormData): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, { method: "POST", body: form });
  const json = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${json.description}`);
  return json.result;
}

const enc = new TextEncoder();
async function hmac(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(msg));
}
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export async function sha256Hex(s: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

export async function webhookSecret() {
  return (await sha256Hex(`musk-webhook:${botToken()}`)).slice(0, 48);
}

export type TgUser = { id: number; first_name: string; username?: string; photo_url?: string };

/** Verifies Telegram WebApp initData; returns the user or null. */
export async function verifyInitData(initData: string): Promise<{ user: TgUser; startParam?: string } | null> {
  if (!initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheck = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = await hmac(enc.encode("WebAppData"), botToken());
  const calc = hex(await hmac(secret, dataCheck));
  if (calc !== hash) return null;
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400 * 7) return null;
  try {
    const user = JSON.parse(params.get("user") || "null") as TgUser | null;
    if (!user?.id) return null;
    return { user, startParam: params.get("start_param") || undefined };
  } catch {
    return null;
  }
}
