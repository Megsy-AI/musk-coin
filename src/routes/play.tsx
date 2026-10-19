import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { playPlinko } from "@/lib/game.functions";
import { PLINKO_MULTIPLIERS, PLINKO_ROWS, PLINKO_MIN_BET } from "@/lib/plinko";
import { useMe } from "@/hooks/use-me";
import { fmt, haptic, initData } from "@/lib/tg-client";
import { GramPill, PageTitle, TelegramNotice } from "@/components/Header";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Plinko — Musk Coin" },
      { name: "description", content: "Drop the ball and multiply your Musk Coin in Plinko." },
      { property: "og:title", content: "Plinko — Musk Coin" },
      { property: "og:description", content: "Drop the ball and multiply your Musk Coin in Plinko." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlinkoPage,
});

const W = 340, TOP = 24, GAP_Y = 24, GAP_X = W / (PLINKO_ROWS + 2);
const pegX = (row: number, i: number) => W / 2 + (i - row / 2) * GAP_X;
const pegY = (row: number) => TOP + row * GAP_Y;
const H = pegY(PLINKO_ROWS) + 36;

type Ball = { id: number; x: number; y: number; done: boolean };

function slotTone(m: number) {
  if (m >= 4) return "bg-gold text-primary-foreground";
  if (m >= 1.1) return "bg-accent/80 text-accent-foreground";
  return "bg-secondary text-muted-foreground";
}

function PlinkoPage() {
  const { me, setGram, inTelegram } = useMe();
  const play = useServerFn(playPlinko);
  const [bet, setBet] = useState(1);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [hit, setHit] = useState<number | null>(null);
  const [last, setLast] = useState<{ m: number; win: number }[]>([]);

  const drop = async () => {
    if (!inTelegram) return toast("Open the app from Telegram");
    if ((me?.gram ?? 0) < bet) return toast.error("Not enough balance");
    haptic("medium");
    try {
      const r = await play({ data: { initData: initData(), bet } });
      setGram((me?.gram ?? 0) - bet);
      const id = Date.now() + Math.random();
      let x = W / 2;
      setBalls((b) => [...b, { id, x, y: 4, done: false }]);
      for (let row = 0; row < PLINKO_ROWS; row++) {
        await new Promise((res) => setTimeout(res, 140));
        x += (r.path[row] ? 0.5 : -0.5) * GAP_X;
        const y = pegY(row) + GAP_Y / 2;
        setBalls((b) => b.map((ball) => (ball.id === id ? { ...ball, x, y } : ball)));
        haptic("light");
      }
      await new Promise((res) => setTimeout(res, 160));
      setBalls((b) => b.map((ball) => (ball.id === id ? { ...ball, y: H - 18, done: true } : ball)));
      setHit(r.slot);
      setGram(r.balance);
      setLast((l) => [{ m: PLINKO_MULTIPLIERS[r.slot], win: r.payout }, ...l].slice(0, 6));
      haptic(r.payout >= bet ? "success" : "light");
      setTimeout(() => {
        setBalls((b) => b.filter((ball) => ball.id !== id));
        setHit((h) => (h === r.slot ? null : h));
      }, 600);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <div>
      <TelegramNotice />
      <div className="flex items-start justify-between">
        <PageTitle title="Plinko" subtitle="Drop. Bounce. Multiply." />
        <GramPill />
      </div>

      <div className="glass animate-rise overflow-hidden rounded-3xl p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {Array.from({ length: PLINKO_ROWS }).map((_, row) =>
            Array.from({ length: row + 3 }).map((__, i) => (
              <circle key={`${row}-${i}`} cx={pegX(row, i - 1)} cy={pegY(row) + 6} r="3" fill="var(--foreground)" opacity="0.55" />
            )),
          )}
          {balls.map((b) => (
            <circle key={b.id} cx={b.x} cy={b.y} r="7" fill="var(--primary)" style={{ transition: "cx 140ms ease-in, cy 140ms ease-in" }} />
          ))}
        </svg>
        <div className="mt-1 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${PLINKO_MULTIPLIERS.length}, 1fr)` }}>
          {PLINKO_MULTIPLIERS.map((m, i) => (
            <div
              key={i}
              className={`rounded-md py-1.5 text-center text-[9px] font-bold transition-transform ${slotTone(m)} ${hit === i ? "-translate-y-1 scale-110" : ""}`}
            >
              {m}x
            </div>
          ))}
        </div>
      </div>

      <div className="glass animate-rise mt-4 rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Bet (GRAM)</span>
          <span className="text-lg font-semibold tabular-nums">{fmt(bet)}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[PLINKO_MIN_BET, 1, 5, 10].map((v) => (
            <button key={v} onClick={() => setBet(v)} className={`press rounded-xl py-2 text-sm font-semibold ${bet === v ? "bg-foreground text-background" : "bg-secondary"}`}>
              {fmt(v)}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={() => setBet((b) => Math.max(PLINKO_MIN_BET, Math.round((b / 2) * 100) / 100))} className="press rounded-xl bg-secondary py-2 text-sm font-semibold">½</button>
          <button onClick={() => setBet((b) => Math.min(100, b * 2))} className="press rounded-xl bg-secondary py-2 text-sm font-semibold">2×</button>
        </div>
        <button onClick={drop} className="press mt-4 w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-primary-foreground">
          Drop ball
        </button>
      </div>

      {last.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {last.map((l, i) => (
            <span key={i} className="glass rounded-full px-3 py-1 text-xs font-semibold tabular-nums">
              {l.m}x · {fmt(l.win)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
