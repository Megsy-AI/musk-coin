import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronRight } from "lucide-react";
import { completeTask, listTasks } from "@/lib/game.functions";
import { useMe } from "@/hooks/use-me";
import { fmt, haptic, initData, openLink } from "@/lib/tg-client";
import { BalancePill, PageTitle, TelegramNotice } from "@/components/Header";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Musk Coin" },
      { name: "description", content: "Complete simple tasks to earn Musk Coin." },
      { property: "og:title", content: "Tasks — Musk Coin" },
      { property: "og:description", content: "Complete simple tasks to earn Musk Coin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const list = useServerFn(listTasks);
  const complete = useServerFn(completeTask);
  const qc = useQueryClient();
  const { setBalance, inTelegram } = useMe();
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => list({ data: { initData: initData() } }) });

  const onTap = async (id: string, link: string, done: boolean) => {
    if (done) return;
    if (!opened[id]) {
      openLink(link);
      setOpened((o) => ({ ...o, [id]: true }));
      return;
    }
    if (!inTelegram) return toast("Open the app from Telegram");
    try {
      const r = await complete({ data: { initData: initData(), taskId: id } });
      haptic("success");
      setBalance(r.balance);
      toast.success(`+${fmt(r.reward)} MUSK`);
      qc.invalidateQueries({ queryKey: ["tasks"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <div>
      <TelegramNotice />
      <div className="flex items-start justify-between">
        <PageTitle title="Tasks" subtitle="Earn MUSK with quick actions." />
        <BalancePill />
      </div>
      <div className="glass animate-rise overflow-hidden rounded-3xl">
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && !tasks?.length && <p className="p-5 text-sm text-muted-foreground">No tasks right now. Check back soon.</p>}
        {tasks?.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onTap(t.id, t.link, t.done)}
            className={`press flex w-full items-center gap-3 px-4 py-3 text-left ${i ? "border-t" : ""}`}
          >
            {t.hasImage ? (
              <img src={`/api/public/task-image/${t.id}`} alt="" loading="lazy" width={48} height={48} className="h-12 w-12 rounded-xl bg-secondary object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{t.title}</p>
              <p className="text-[13px] text-muted-foreground">+{fmt(t.reward)} MUSK</p>
            </div>
            {t.done ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-success"><Check className="h-4 w-4" /></span>
            ) : opened[t.id] ? (
              <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Claim</span>
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
