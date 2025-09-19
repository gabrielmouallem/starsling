import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export default async function Integrations() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  let isConnected = false;
  if (userId) {
    const supabase = await createSupabaseClient();
    const { data } = await supabase
      .from("integration_installations")
      .select("installation_id")
      .eq("provider", "github")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    isConnected = Boolean(data?.installation_id);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      <div className="border rounded-md p-4 flex items-center justify-between">
        <div>
          <div className="font-medium">GitHub</div>
          <div className="text-sm text-muted-foreground">
            {isConnected ? "Connected" : "Not connected"}
          </div>
        </div>
        {isConnected ? (
          <form action="/api/github/disconnect" method="post">
            <Button type="submit" variant="secondary">
              Disconnect
            </Button>
          </form>
        ) : (
          <Link href="/api/github/auth">
            <Button>Connect GitHub</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
