import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/daily-post")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { runDailyPost } = await import("@/lib/daily-post.server");
        const r = await runDailyPost(false);
        return Response.json(r, { status: r.ok ? 200 : 500 });
      },
    },
  },
});
