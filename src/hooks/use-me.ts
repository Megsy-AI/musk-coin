import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe, type Me } from "@/lib/game.functions";
import { initData } from "@/lib/tg-client";

export function useMe() {
  const fn = useServerFn(getMe);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["me"],
    queryFn: () => fn({ data: { initData: initData() } }),
    staleTime: 15_000,
  });
  const setBalance = (balance: number) =>
    qc.setQueryData<Me | null>(["me"], (m) => (m ? { ...m, balance } : m));
  return { ...q, me: q.data ?? null, setBalance, inTelegram: !!initData() };
}
