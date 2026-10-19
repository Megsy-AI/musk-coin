import { createFileRoute } from "@tanstack/react-router";

// Points the bot's webhook + menu button at whatever host serves this request.
// Idempotent and safe: it can only point the bot at this same app.
export const Route = createFileRoute("/api/public/telegram/setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { tg, webhookSecret } = await import("@/lib/telegram.server");
        const origin = new URL(request.url).origin;
        await tg("setWebhook", {
          url: `${origin}/api/public/telegram/webhook`,
          secret_token: await webhookSecret(),
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: false,
        });
        await tg("setChatMenuButton", { menu_button: { type: "web_app", text: "Open", web_app: { url: origin } } });
        await tg("setMyCommands", {
          commands: [
            { command: "start", description: "Open Musk Coin" },
            { command: "admin", description: "Admin panel" },
            { command: "cancel", description: "Cancel current action" },
          ],
        });
        const info = await tg("getWebhookInfo", {});
        return Response.json({ ok: true, webhook: (info as any).url });
      },
    },
  },
});
