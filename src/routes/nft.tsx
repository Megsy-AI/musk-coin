import { createFileRoute } from "@tanstack/react-router";
import n1 from "@/assets/nft/nft-1.jpg";
import n2 from "@/assets/nft/nft-2.jpg";
import n3 from "@/assets/nft/nft-3.jpg";
import n4 from "@/assets/nft/nft-4.jpg";
import n5 from "@/assets/nft/nft-5.jpg";
import { BalancePill, PageTitle } from "@/components/Header";
import { fmt } from "@/lib/tg-client";

export const Route = createFileRoute("/nft")({
  head: () => ({
    meta: [
      { title: "NFT Collection — Musk Coin" },
      { name: "description", content: "Browse the Musk Coin spirit NFT collection." },
      { property: "og:title", content: "NFT Collection — Musk Coin" },
      { property: "og:description", content: "Browse the Musk Coin spirit NFT collection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NftPage,
});

const NFTS = [
  { img: n1, name: "Astro Spirit", rarity: "Legendary", price: 50000 },
  { img: n3, name: "Crown Spirit", rarity: "Epic", price: 25000 },
  { img: n4, name: "Chrome Spirit", rarity: "Rare", price: 12000 },
  { img: n2, name: "Cool Spirit", rarity: "Rare", price: 9000 },
  { img: n5, name: "Beat Spirit", rarity: "Common", price: 4000 },
];

function NftPage() {
  const [hero, ...rest] = NFTS;
  return (
    <div>
      <div className="flex items-start justify-between">
        <PageTitle title="Collection" subtitle="Musk Spirits" />
        <BalancePill />
      </div>
      <div className="glass animate-rise overflow-hidden rounded-3xl">
        <img src={hero.img} alt={hero.name} width={816} height={816} className="aspect-square w-full object-cover" />
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-semibold">{hero.name}</p>
            <p className="text-[13px] text-primary">{hero.rarity}</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold tabular-nums">{fmt(hero.price)}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {rest.map((n, i) => (
          <div key={n.name} className="glass animate-rise overflow-hidden rounded-3xl" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
            <img src={n.img} alt={n.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover" />
            <div className="p-3">
              <p className="text-[15px] font-semibold">{n.name}</p>
              <div className="mt-0.5 flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">{n.rarity}</span>
                <span className="font-semibold tabular-nums">{fmt(n.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[13px] text-muted-foreground">Minting opens soon.</p>
    </div>
  );
}
