import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { githubAppClient } from "@/lib/github/client";

export const githubWebhookReceived = inngest.createFunction(
  { id: "github-webhook-received" },
  { event: "github/webhook.received" },
  async ({ event, step }) => {
    await step.run("log-webhook", async () => {
      console.log("GitHub webhook received:", {
        delivery: event.data.delivery,
        name: event.data.name,
        action: event.data.payload?.action,
      });
    });
    const payload = event.data.payload as any;
    // Handle installation created/removed to upsert/delete installation rows
    if (event.data.name === "installation" && payload?.installation?.id) {
      const supabase = createAdminClient();
      const installationId = String(payload.installation.id);
      const accountLogin = payload.installation.account?.login ?? null;
      const accountType = payload.installation.account?.type ?? null;
      if (payload.action === "created") {
        await step.run("upsert-installation", async () => {
          await supabase.from("integration_installations").upsert(
            [{
              provider: "github",
              installation_id: installationId,
              user_id: null,
              organization_id: null,
              metadata: { account_login: accountLogin, account_type: accountType },
            } as any],
            { onConflict: "installation_id" }
          );
        });
      }
      if (payload.action === "deleted") {
        await step.run("delete-installation", async () => {
          await supabase
            .from("integration_installations")
            .delete()
            .eq("installation_id", installationId)
            .eq("provider", "github");
        });
      }
    }

    // Handle issue opened/edited/closed: upsert an issues table if present
    if (event.data.name === "issues" && payload?.installation?.id) {
      const supabase = createAdminClient();
      const installationId = String(payload.installation.id);
      const issue = payload.issue;
      if (issue) {
        await step.run("upsert-issue", async () => {
          // Table: issues (installation_id text, issue_id bigint, title text, state text, number int, repo_full_name text, updated_at timestamptz)
          await supabase.from("issues").upsert([
            {
              provider: "github",
              installation_id: installationId,
              issue_id: issue.id,
              number: issue.number,
              title: issue.title,
              state: issue.state,
              repo_full_name: payload.repository?.full_name ?? null,
              updated_at: new Date().toISOString(),
            } as any,
          ], { onConflict: "issue_id" });
        });
      }
    }
    return { ok: true };
  }
);

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data?.email ?? "World"}!` };
  }
);


