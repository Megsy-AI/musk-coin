import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  PLINKO_MAX_BET,
  PLINKO_MIN_BET,
  PLINKO_ROWS,
  MINING_DURATION_MS,
  minedAmount,
  payoutFor,
  slotFromPath,
} from "./plinko";

const Auth = z.object({ initData: z.string().max(4096) });

async function ctx(initData: string) {
  const { verifyInitData } = await import("./telegram.server");
  const v = await verifyInitData(initData);
  if (!v) throw new Error("Open the app from Telegram");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { db: supabaseAdmin, ...v };
}

export type Me = {
  tgId: number;
  firstName: string;
  username: string | null;
  photoUrl: string | null;
  balance: number;
  miningStartedAt: number | null;
  referrals: number;
};

export const getMe = createServerFn({ method: "POST" })
  .inputValidator((d) => Auth.parse(d))
  .handler(async ({ data }): Promise<Me | null> => {
    if (!data.initData) return null;
    const { db, user, startParam } = await ctx(data.initData);
    const { data: existing } = await db.from("players").select("*").eq("tg_id", user.id).maybeSingle();
    let row = existing;
    if (!row) {
      const ref = startParam && /^\d+$/.test(startParam) && Number(startParam) !== user.id ? Number(startParam) : null;
      const { data: created, error } = await db
        .from("players")
        .insert({ tg_id: user.id, first_name: user.first_name, username: user.username ?? null, photo_url: user.photo_url ?? null, referred_by: ref })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = created;
      if (ref) await db.rpc("add_balance", { _tg_id: ref, _delta: 250 }).then(() => null, () => null);
    } else {
      await db.from("players").update({ first_name: user.first_name, username: user.username ?? null, photo_url: user.photo_url ?? null }).eq("tg_id", user.id);
    }
    const { count } = await db.from("players").select("tg_id", { count: "exact", head: true }).eq("referred_by", user.id);
    return {
      tgId: row.tg_id,
      firstName: row.first_name,
      username: row.username,
      photoUrl: row.photo_url,
      balance: Number(row.balance),
      miningStartedAt: row.mining_started_at ? new Date(row.mining_started_at).getTime() : null,
      referrals: count ?? 0,
    };
  });

/** Starts a session, or claims a finished one and starts the next. */
export const mineAction = createServerFn({ method: "POST" })
  .inputValidator((d) => Auth.parse(d))
  .handler(async ({ data }) => {
    const { db, user } = await ctx(data.initData);
    const { data: p } = await db.from("players").select("mining_started_at").eq("tg_id", user.id).single();
    const now = Date.now();
    const started = p?.mining_started_at ? new Date(p.mining_started_at).getTime() : null;
    let claimed = 0;
    if (started) {
      if (now - started < MINING_DURATION_MS) throw new Error("Mining still in progress");
      claimed = minedAmount(started, now);
      await db.rpc("add_balance", { _tg_id: user.id, _delta: claimed });
    }
    await db.from("players").update({ mining_started_at: new Date(now).toISOString() }).eq("tg_id", user.id);
    return { claimed };
  });

export const playPlinko = createServerFn({ method: "POST" })
  .inputValidator((d) => Auth.extend({ bet: z.number().min(PLINKO_MIN_BET).max(PLINKO_MAX_BET) }).parse(d))
  .handler(async ({ data }) => {
    const { db, user } = await ctx(data.initData);
    const bet = Math.floor(data.bet);
    try {
      await db.rpc("add_balance", { _tg_id: user.id, _delta: -bet }).throwOnError();
    } catch {
      throw new Error("Not enough balance");
    }
    const rnd = new Uint8Array(PLINKO_ROWS);
    crypto.getRandomValues(rnd);
    const path = [...rnd].map((b) => b & 1);
    const slot = slotFromPath(path);
    const payout = payoutFor(bet, slot);
    const { data: balance } = await db.rpc("add_balance", { _tg_id: user.id, _delta: payout });
    return { path, slot, payout, balance: Number(balance) };
  });

export type TaskItem = { id: string; title: string; link: string; reward: number; hasImage: boolean; done: boolean };

export const listTasks = createServerFn({ method: "POST" })
  .inputValidator((d) => Auth.parse(d))
  .handler(async ({ data }): Promise<TaskItem[]> => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: tasks } = await db.from("tasks").select("id,title,link,reward,image_url").order("created_at", { ascending: false });
    let done = new Set<string>();
    if (data.initData) {
      const { verifyInitData } = await import("./telegram.server");
      const v = await verifyInitData(data.initData);
      if (v) {
        const { data: c } = await db.from("task_completions").select("task_id").eq("tg_id", v.user.id);
        done = new Set((c ?? []).map((x) => x.task_id));
      }
    }
    return (tasks ?? []).map((t) => ({ id: t.id, title: t.title, link: t.link, reward: Number(t.reward), hasImage: !!t.image_url, done: done.has(t.id) }));
  });

export const completeTask = createServerFn({ method: "POST" })
  .inputValidator((d) => Auth.extend({ taskId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { db, user } = await ctx(data.initData);
    const { data: task } = await db.from("tasks").select("reward").eq("id", data.taskId).single();
    if (!task) throw new Error("Task not found");
    const { error } = await db.from("task_completions").insert({ tg_id: user.id, task_id: data.taskId });
    if (error) throw new Error("Already completed");
    const { data: balance } = await db.rpc("add_balance", { _tg_id: user.id, _delta: Number(task.reward) });
    return { balance: Number(balance), reward: Number(task.reward) };
  });
