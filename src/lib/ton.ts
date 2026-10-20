// Browser-only TON Connect helpers. Import lazily from event handlers / effects.
let ui: any = null;

export async function getTonConnect() {
  if (ui) return ui;
  const { TonConnectUI } = await import("@tonconnect/ui");
  ui = new TonConnectUI({ manifestUrl: `${window.location.origin}/tonconnect-manifest.json` });
  return ui;
}

// Single-cell BOC holding a text comment (op 0 + UTF-8). Fits memos up to ~120 bytes.
export function commentPayload(text: string): string {
  const body = new TextEncoder().encode(text);
  const data = new Uint8Array(4 + body.length);
  data.set(body, 4);
  const d2 = data.length * 2;
  const cell = new Uint8Array([0, d2, ...data]);
  const boc = new Uint8Array([0xb5, 0xee, 0x9c, 0x72, 0x01, 0x01, 1, 1, 0, cell.length, 0, ...cell]);
  let s = "";
  boc.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}
