import { githubAppClient, type GithubInstallation } from "@/lib/github/client";

// Re-export the type for backwards compatibility
export type { GithubInstallation };

// Backwards compatible function that uses the new client
export async function fetchInstallationDetails(installationId: string): Promise<GithubInstallation | null> {
  return githubAppClient.installations.get(installationId);
}


