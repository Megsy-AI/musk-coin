import mascot from "@/assets/mascot.png";
import { useMe } from "@/hooks/use-me";
import { fmt } from "@/lib/tg-client";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="animate-rise mb-6">
      <h1 className="text-[34px] font-bold leading-tight tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function BalancePill() {
  const { me } = useMe();
  return (
    <div className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4">
      <img src={mascot} alt="" width={28} height={28} className="h-7 w-7 rounded-full bg-secondary" />
      <span className="text-sm font-semibold tabular-nums">{fmt(me?.balance ?? 0)}</span>
      <span className="text-xs text-muted-foreground">MUSK</span>
    </div>
  );
}

export function GramPill() {
  const { me } = useMe();
  return (
    <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
      <span className="text-sm font-semibold tabular-nums">{fmt(me?.gram ?? 0)}</span>
      <span className="text-xs text-muted-foreground">GRAM</span>
    </div>
  );
}

export function TelegramNotice() {
  const { inTelegram } = useMe();
  if (inTelegram) return null;
  return (
    <div className="glass mb-4 rounded-2xl px-4 py-3 text-[13px] text-muted-foreground">
      Open Musk Coin from the Telegram bot to save your progress.
    </div>
  );
}
