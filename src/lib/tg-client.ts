// Browser-side Telegram WebApp access.
export function tgWebApp(): any {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}
export function initData(): string {
  return tgWebApp()?.initData || "";
}
export function haptic(kind: "light" | "medium" | "success" | "error" = "light") {
  const h = tgWebApp()?.HapticFeedback;
  if (!h) return;
  if (kind === "success" || kind === "error") h.notificationOccurred(kind);
  else h.impactOccurred(kind);
}
export function openLink(url: string) {
  const w = tgWebApp();
  if (w && /t\.me\//.test(url)) w.openTelegramLink(url);
  else if (w) w.openLink(url);
  else window.open(url, "_blank");
}
export const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
