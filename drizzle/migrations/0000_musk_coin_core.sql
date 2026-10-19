CREATE TABLE public.players (
  tg_id bigint PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  username text,
  photo_url text,
  balance numeric NOT NULL DEFAULT 0,
  mining_started_at timestamptz,
  referred_by bigint,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  link text NOT NULL,
  reward numeric NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_completions (
  tg_id bigint NOT NULL REFERENCES public.players(tg_id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tg_id, task_id)
);
GRANT ALL ON public.task_completions TO service_role;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bot_admins (
  tg_id bigint PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bot_admins TO service_role;
ALTER TABLE public.bot_admins ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bot_sessions (
  tg_id bigint PRIMARY KEY,
  step text,
  draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bot_sessions TO service_role;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.daily_posts (
  post_date date PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  caption text,
  image_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.daily_posts TO service_role;
ALTER TABLE public.daily_posts ENABLE ROW LEVEL SECURITY;

-- Atomic balance change; returns new balance
CREATE OR REPLACE FUNCTION public.add_balance(_tg_id bigint, _delta numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nb numeric;
BEGIN
  UPDATE players SET balance = balance + _delta, updated_at = now()
  WHERE tg_id = _tg_id AND balance + _delta >= 0
  RETURNING balance INTO nb;
  IF nb IS NULL THEN RAISE EXCEPTION 'insufficient_balance'; END IF;
  RETURN nb;
END $$;
REVOKE ALL ON FUNCTION public.add_balance(bigint, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_balance(bigint, numeric) TO service_role;