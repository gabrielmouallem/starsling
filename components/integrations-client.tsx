"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Github,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type InstallationRow = {
  provider: string;
  installation_id: string;
  organization_id: string | null;
  metadata: Record<string, unknown> | null;
};

type IntegrationsClientProps = {
  initialInstallations: InstallationRow[];
};

async function fetchInstallations(): Promise<InstallationRow[]> {
  const { data } = await axios.get("/api/github/installations");
  return data.installations;
}

async function disconnectInstallation(installationId: string) {
  const { data } = await axios.post("/api/github/disconnect", {
    installation_id: installationId,
  });
  return data;
}

export default function IntegrationsClient({
  initialInstallations,
}: IntegrationsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Use React Query for fetching installations
  const { data: installations = initialInstallations, error: fetchError } =
    useQuery({
      queryKey: ["github-installations"],
      queryFn: fetchInstallations,
      initialData: initialInstallations,
      // Refetch every 30 seconds to keep data fresh
      refetchInterval: 30000,
    });

  // Use React Query for disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectInstallation,
    onMutate: async (installationId) => {
      setDisconnectingId(installationId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["github-installations"] });

      // Snapshot the previous value
      const previousInstallations = queryClient.getQueryData<InstallationRow[]>(
        ["github-installations"]
      );

      // Optimistically update to the new value
      queryClient.setQueryData<InstallationRow[]>(
        ["github-installations"],
        (old = []) =>
          old.filter((inst) => inst.installation_id !== installationId)
      );

      // Return a context object with the snapshotted value
      return { previousInstallations };
    },
    onError: (_err, _installationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInstallations) {
        queryClient.setQueryData(
          ["github-installations"],
          context.previousInstallations
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct state
      queryClient.invalidateQueries({ queryKey: ["github-installations"] });
      router.refresh();
      setDisconnectingId(null);
    },
  });

  const githubInstalls = installations.filter((i) => i.provider === "github");
  const githubConnected = githubInstalls.length > 0;

  const displayError = fetchError || disconnectMutation.error;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your external services to enhance your workflow
        </p>
      </div>

      {/* Error message */}
      {displayError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Connection Error</p>
              <p className="text-sm text-muted-foreground mt-1">
                {displayError instanceof Error
                  ? displayError.message
                  : "Unable to complete the operation. Please try again."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitHub Integration Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-foreground rounded-lg">
                <Github className="h-6 w-6 text-background" />
              </div>
              <div>
                <CardTitle className="text-xl">GitHub</CardTitle>
                <CardDescription className="mt-1">
                  Access repositories and manage your GitHub projects
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {githubConnected ? (
                <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Not Connected</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {!githubConnected ? (
            <div className="py-4 text-center">
              <p className="text-muted-foreground mb-4">
                Connect your GitHub account to get started
              </p>
              <Link href="/api/github/auth">
                <Button className="gap-2">
                  <Github className="h-4 w-4" />
                  Connect GitHub Account
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {githubInstalls.map((inst) => {
                const accountLogin =
                  (inst.metadata?.account_login as string | undefined) ||
                  "Unknown Account";
                const accountType =
                  (inst.metadata?.account_type as string | undefined) || "User";
                const isOrganization =
                  accountType.toLowerCase() === "organization";

                return (
                  <div
                    key={inst.installation_id}
                    className="p-4 bg-secondary/50 rounded-lg border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-full border border-border">
                          {isOrganization ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {accountLogin}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isOrganization
                              ? "Organization"
                              : "Personal Account"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://github.com/${accountLogin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            disconnectMutation.mutate(inst.installation_id)
                          }
                          disabled={
                            disconnectingId === inst.installation_id ||
                            disconnectMutation.isPending
                          }
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive"
                        >
                          {disconnectingId === inst.installation_id
                            ? "Disconnecting..."
                            : "Disconnect"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Another Account Button */}
              <div className="pt-2">
                <Link href="/api/github/auth">
                  <Button variant="outline" className="w-full gap-2">
                    <Github className="h-4 w-4" />
                    Add Another GitHub Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
