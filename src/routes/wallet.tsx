import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Copy, Users } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useMe } from "@/hooks/use-me";
import { checkDeposit, listWalletRequests, requestWithdraw, startDeposit } from "@/lib/game.functions";
import { DEPOSIT_ADDRESS } from "@/lib/catalog";
import { fmt, haptic, initData } from "@/lib/tg-client";
import { PageTitle, TelegramNotice } from "@/components/Header";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Musk Coin" },
      { name: "description", content: "Your GRAM and Musk Coin balances, deposits and withdrawals." },
      { property: "og:title", content: "Wallet — Musk Coin" },
      { property: "og:description", content: "Your GRAM and Musk Coin balances, deposits and withdrawals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

const BOT = "MuskCoinBot";

function WalletPage() {
  const { me, refetch, inTelegram } = useMe();
  const qc = useQueryClient();
  const deposit = useServerFn(startDeposit);
  const check = useServerFn(checkDeposit);
  const withdraw = useServerFn(requestWithdraw);
  const listReq = useServerFn(listWalletRequests);
  const { data: history } = useQuery({ queryKey: ["wallet-req"], queryFn: () => listReq({ data: { initData: initData() } }) });
  const [sheet, setSheet] = useState<null | "deposit" | "withdraw">(null);
  const [amount, setAmount] = useState("");
  const [field, setField] = useState("");
  const [busy, setBusy] = useState(false);

  const bot = (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initDataUnsafe?.receiver?.username) || BOT;
  const refLink = me ? `https://t.me/${bot}?start=${me.tgId}` : "";
  const copy = async (text: string, msg: string) => {
    await navigator.clipboard.writeText(text).catch(() => null);
    toast.success(msg);
  };

  const connectWallet = async () => {
    const tc = await (await import("@/lib/ton")).getTonConnect();
    if (!tc.connected) await tc.openModal();
    return tc;
  };

  const waitConnected = async (tc: any) => {
    for (let i = 0; i < 120 && !tc.connected; i++) await new Promise((r) => setTimeout(r, 500));
    if (!tc.connected) throw new Error("Wallet not connected");
  };

  const fillMyAddress = async () => {
    const tc = await connectWallet();
    await waitConnected(tc);
    const { toUserFriendlyAddress } = await import("@tonconnect/ui");
    setField(toUserFriendlyAddress(tc.account.address));
  };

  const submit = async () => {
    if (!inTelegram) return toast("Open the app from Telegram");
    const a = Number(amount);
    if (!a || a <= 0) return toast.error("Enter an amount");
    setBusy(true);
    try {
      if (sheet === "deposit") {
        const tc = await connectWallet();
        await waitConnected(tc);
        const d = await deposit({ data: { initData: initData(), amount: a } });
        const { commentPayload } = await import("@/lib/ton");
        await tc.sendTransaction({ validUntil: Math.floor(Date.now() / 1000) + 600, messages: [{ address: d.address, amount: d.nano, payload: commentPayload(d.memo) }] });
        toast("Confirming on the blockchain…");
        setSheet(null);
        let ok = false;
        for (let i = 0; i < 24 && !ok; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const r = await check({ data: { initData: initData(), id: d.id } }).catch(() => null);
          ok = r?.status === "approved";
        }
        if (ok) { haptic("success"); toast.success(`+${fmt(a)} GRAM added`); }
        else toast("Still confirming. Your balance updates automatically.");
      } else {
        await withdraw({ data: { initData: initData(), amount: a, address: field } });
        haptic("success");
        toast.success("Withdrawal requested. You'll get a message once it's sent.");
        setSheet(null);
      }
      setAmount("");
      setField("");
      await refetch();
      qc.invalidateQueries({ queryKey: ["wallet-req"] });
    } catch (e: any) {
      haptic("error");
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <TelegramNotice />
      <PageTitle title="Wallet" />

      <div className="animate-rise relative overflow-hidden rounded-[28px] bg-gold p-6 text-primary-foreground shadow-2xl">
        <img src={mascot} alt="" width={1024} height={1024} className="pointer-events-none absolute -right-8 -top-6 h-40 w-40 opacity-90" />
        <p className="text-[13px] font-semibold opacity-70">GRAM balance</p>
        <p className="mt-2 text-[44px] font-bold leading-none tabular-nums tracking-tight">{fmt(me?.gram ?? 0)}</p>
        <p className="mt-1 text-sm font-semibold opacity-70">GRAM</p>
        <div className="mt-8 flex items-end justify-between text-[13px] font-medium">
          <span>{me?.firstName ?? "Guest"}</span>
          <span className="opacity-70">{me?.username ? `@${me.username}` : ""}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => setSheet("deposit")} className="press glass flex flex-col items-center gap-2 rounded-3xl py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"><ArrowDownLeft className="h-5 w-5" /></span>
          <span className="text-[15px] font-semibold">Deposit</span>
        </button>
        <button onClick={() => setSheet("withdraw")} className="press glass flex flex-col items-center gap-2 rounded-3xl py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"><ArrowUpRight className="h-5 w-5" /></span>
          <span className="text-[15px] font-semibold">Withdraw</span>
        </button>
      </div>

      <div className="glass animate-rise mt-4 overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[15px] font-semibold">GRAM</span>
          <span className="tabular-nums">{fmt(me?.gram ?? 0)}</span>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3.5">
          <span className="text-[15px] font-semibold">Musk Coin</span>
          <span className="tabular-nums">{fmt(me?.balance ?? 0)}</span>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3.5">
          <span className="text-[15px] font-semibold">NFTs</span>
          <span className="tabular-nums">{me?.nfts.length ?? 0}</span>
        </div>
      </div>

      {!!history?.length && (
        <div className="glass animate-rise mt-4 overflow-hidden rounded-3xl">
          <p className="px-4 pt-3.5 text-[13px] font-medium text-muted-foreground">Activity</p>
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between border-t px-4 py-3 first-of-type:border-t-0">
              <div>
                <p className="text-[15px] font-semibold capitalize">{h.kind}</p>
                <p className="text-[12px] text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{h.kind === "deposit" ? "+" : "−"}{fmt(h.amount)}</p>
                <p className={`text-[12px] capitalize ${h.status === "approved" ? "text-success" : h.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}>{h.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass animate-rise mt-4 rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><Users className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">Invite friends · {me?.referrals ?? 0}</p>
            <p className="text-[13px] text-muted-foreground">Earn 250 MUSK for each friend.</p>
          </div>
        </div>
        <button onClick={() => refLink && copy(refLink, "Invite link copied")} disabled={!refLink} className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background disabled:opacity-50">
          <Copy className="h-4 w-4" /> Copy invite link
        </button>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-[60] flex items-end bg-background/60 backdrop-blur-sm" onClick={() => setSheet(null)}>
          <div className="glass-strong animate-rise mx-auto w-full max-w-md rounded-t-[32px] p-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-secondary" />
            <h2 className="text-2xl font-bold">{sheet === "deposit" ? "Deposit GRAM" : "Withdraw GRAM"}</h2>
            {sheet === "deposit" && (
              DEPOSIT_ADDRESS ? (
                <p className="mt-2 text-[14px] text-muted-foreground">Pay with your TON wallet. 1 TON = 1 GRAM, credited automatically.</p>
              ) : (
                <p className="mt-3 text-[14px] text-muted-foreground">Deposits open soon.</p>
              )
            )}
            {sheet === "withdraw" && <p className="mt-2 text-[14px] text-muted-foreground">Available: {fmt(me?.gram ?? 0)} GRAM · minimum 1</p>}
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Amount" className="mt-4 w-full rounded-2xl bg-secondary px-4 py-3.5 text-[17px] outline-none placeholder:text-muted-foreground" />
            {sheet === "withdraw" && (
              <>
                <input value={field} onChange={(e) => setField(e.target.value)} placeholder="Your wallet address" className="mt-2 w-full rounded-2xl bg-secondary px-4 py-3.5 text-[15px] outline-none placeholder:text-muted-foreground" />
                <button onClick={() => fillMyAddress().catch((e) => toast.error(e?.message ?? "Failed"))} className="press mt-2 w-full rounded-2xl bg-secondary py-3 text-[15px] font-semibold">Use my TON wallet</button>
              </>
            )}
            <button onClick={submit} disabled={busy || (sheet === "deposit" && !DEPOSIT_ADDRESS)} className="press mt-4 w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? "…" : sheet === "deposit" ? "Pay with TON wallet" : "Request withdrawal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
