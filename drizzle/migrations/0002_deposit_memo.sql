ALTER TABLE public.wallet_requests ADD COLUMN IF NOT EXISTS memo text;
CREATE UNIQUE INDEX IF NOT EXISTS wallet_requests_memo_uq ON public.wallet_requests(memo) WHERE memo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS wallet_requests_dep_tx_uq ON public.wallet_requests(tx_ref) WHERE kind = 'deposit' AND status = 'approved';