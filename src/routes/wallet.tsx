import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, Users } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useMe } from "@/hooks/use-me";
import { fmt } from "@/lib/tg-client";
import { PageTitle, TelegramNotice } from "@/components/Header";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Musk Coin" },
      { name: "description", content: "Your Musk Coin balance, referrals and activity." },
      { property: "og:title", content: "Wallet — Musk Coin" },
      { property: "og:description", content: "Your Musk Coin balance, referrals and activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

const BOT = "MuskCoinBot"; // replaced at runtime when Telegram exposes the bot username

function WalletPage() {
  const { me } = useMe();
  const bot = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initDataUnsafe?.receiver?.username) || BOT;
  const refLink = me ? `https://t.me/${bot}?start=${me.tgId}` : "";
  const copy = async () => {
    if (!refLink) return;
    await navigator.clipboard.writeText(refLink).catch(() => null);
    toast.success("Invite link copied");
  };

  return (
    <div>
      <TelegramNotice />
      <PageTitle title="Wallet" />

      <div className="animate-rise relative overflow-hidden rounded-[28px] bg-gold p-6 text-primary-foreground shadow-2xl">
        <img src={mascot} alt="" width={1024} height={1024} className="pointer-events-none absolute -right-8 -top-6 h-40 w-40 opacity-90" />
        <p className="text-[13px] font-semibold opacity-70">Total balance</p>
        <p className="mt-2 text-[44px] font-bold leading-none tabular-nums tracking-tight">{fmt(me?.balance ?? 0)}</p>
        <p className="mt-1 text-sm font-semibold opacity-70">MUSK</p>
        <div className="mt-8 flex items-end justify-between text-[13px] font-medium">
          <span>{me?.firstName ?? "Guest"}</span>
          <span className="opacity-70">{me?.username ? `@${me.username}` : ""}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass animate-rise rounded-3xl p-4">
          <p className="text-xs text-muted-foreground">Asset</p>
          <p className="mt-1 text-[15px] font-semibold">Musk Coin</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">{fmt(me?.balance ?? 0)}</p>
        </div>
        <div className="glass animate-rise rounded-3xl p-4">
          <p className="text-xs text-muted-foreground">Friends</p>
          <p className="mt-1 text-[15px] font-semibold">{me?.referrals ?? 0}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">+250 each</p>
        </div>
      </div>

      <div className="glass animate-rise mt-4 rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><Users className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">Invite friends</p>
            <p className="text-[13px] text-muted-foreground">Earn 250 MUSK for each friend.</p>
          </div>
        </div>
        <button onClick={copy} disabled={!refLink} className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background disabled:opacity-50">
          <Copy className="h-4 w-4" /> Copy invite link
        </button>
      </div>

      <div className="glass animate-rise mt-4 rounded-3xl p-4 text-center">
        <p className="text-[15px] font-semibold">Withdrawals</p>
        <p className="mt-1 text-[13px] text-muted-foreground">Coming after the token launch.</p>
      </div>
    </div>
  );
}
