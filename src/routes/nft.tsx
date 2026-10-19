import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import n1 from "@/assets/nft/nft-1.jpg";
import n2 from "@/assets/nft/nft-2.jpg";
import n3 from "@/assets/nft/nft-3.jpg";
import n4 from "@/assets/nft/nft-4.jpg";
import n5 from "@/assets/nft/nft-5.jpg";
import { GramPill, PageTitle, TelegramNotice } from "@/components/Header";
import { NFTS } from "@/lib/catalog";
import { buyNft } from "@/lib/game.functions";
import { useMe } from "@/hooks/use-me";
import { fmt, haptic, initData } from "@/lib/tg-client";

export const Route = createFileRoute("/nft")({
  head: () => ({
    meta: [
      { title: "NFT Collection — Musk Coin" },
      { name: "description", content: "Collect Musk Spirit NFTs with GRAM." },
      { property: "og:title", content: "NFT Collection — Musk Coin" },
      { property: "og:description", content: "Collect Musk Spirit NFTs with GRAM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NftPage,
});

const IMG: Record<string, string> = { astro: n1, crown: n3, chrome: n4, cool: n2, beat: n5 };

function NftPage() {
  const { me, refetch, inTelegram } = useMe();
  const buy = useServerFn(buyNft);
  const [busy, setBusy] = useState<string | null>(null);

  const onBuy = async (id: string) => {
    if (!inTelegram) return toast("Open the app from Telegram");
    setBusy(id);
    try {
      await buy({ data: { initData: initData(), nftId: id } });
      haptic("success");
      toast.success("NFT added to your collection");
      await refetch();
    } catch (e: any) {
      haptic("error");
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  };

  const Btn = ({ id, price }: { id: string; price: number }) => {
    const owned = me?.nfts.includes(id);
    return (
      <button
        onClick={() => !owned && onBuy(id)}
        disabled={busy === id || owned}
        className={`press rounded-full px-3 py-1.5 text-[13px] font-semibold tabular-nums ${owned ? "bg-success/20 text-success" : "bg-foreground text-background"}`}
      >
        {owned ? "Owned" : busy === id ? "…" : `${fmt(price)} GRAM`}
      </button>
    );
  };

  const [hero, ...rest] = NFTS;
  return (
    <div>
      <TelegramNotice />
      <div className="flex items-start justify-between">
        <PageTitle title="Collection" subtitle="Musk Spirits" />
        <GramPill />
      </div>
      <div className="glass animate-rise overflow-hidden rounded-3xl">
        <img src={IMG[hero.id]} alt={hero.name} width={816} height={816} className="aspect-square w-full object-cover" />
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-semibold">{hero.name}</p>
            <p className="text-[13px] text-primary">{hero.rarity}</p>
          </div>
          <Btn id={hero.id} price={hero.price} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {rest.map((n, i) => (
          <div key={n.id} className="glass animate-rise overflow-hidden rounded-3xl" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
            <img src={IMG[n.id]} alt={n.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover" />
            <div className="p-3">
              <p className="text-[15px] font-semibold">{n.name}</p>
              <p className="mb-2 text-[12px] text-muted-foreground">{n.rarity}</p>
              <Btn id={n.id} price={n.price} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
