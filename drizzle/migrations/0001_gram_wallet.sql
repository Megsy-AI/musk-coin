ALTER TABLE public.players ADD COLUMN gram_balance numeric NOT NULL DEFAULT 0;

CREATE TABLE public.wallet_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tg_id bigint NOT NULL REFERENCES public.players(tg_id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('deposit','withdraw')),
  amount numeric NOT NULL CHECK (amount > 0),
  address text,
  tx_ref text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.wallet_requests TO service_role;
ALTER TABLE public.wallet_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_nfts (
  tg_id bigint NOT NULL REFERENCES public.players(tg_id) ON DELETE CASCADE,
  nft_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tg_id, nft_id)
);
GRANT ALL ON public.user_nfts TO service_role;
ALTER TABLE public.user_nfts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.add_gram(_tg_id bigint, _delta numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nb numeric;
BEGIN
  UPDATE players SET gram_balance = gram_balance + _delta, updated_at = now()
  WHERE tg_id = _tg_id AND gram_balance + _delta >= 0
  RETURNING gram_balance INTO nb;
  IF nb IS NULL THEN RAISE EXCEPTION 'insufficient_balance'; END IF;
  RETURN nb;
END $$;
REVOKE ALL ON FUNCTION public.add_gram(bigint, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_gram(bigint, numeric) TO service_role;