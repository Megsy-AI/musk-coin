<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Musk Coin architecture
- Players are identified by verified Telegram WebApp initData (HMAC with the bot token) inside server functions; no Supabase Auth. Why: it is a Telegram Mini App.
- All tables are service-role only (RLS on, no policies); every read/write goes through server functions or /api/public routes. Why: there is no browser session to scope RLS to.
- The Telegram bot runs at /api/public/telegram/webhook; GET /api/public/telegram/setup re-points the webhook and menu button to the host serving it. Why: lets the bot follow whichever domain is live.
- Task photos are stored as Telegram file_ids and served via /api/public/task-image/$id. Why: workspace blocks public storage buckets.
