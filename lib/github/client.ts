import { SignJWT, importPKCS8 } from "jose";
import axios, { AxiosRequestConfig } from "axios";
import { createPrivateKey } from "crypto";

export type GithubInstallation = {
  id: number;
  account?: {
    id: number;
    login: string;
    type?: string;
    html_url?: string;
  };
  target_type?: "Organization" | "User" | string;
  html_url?: string;
};

// Private helper functions
function normalizePrivateKey(pem: string): string {
  return pem.replace(/\\n/g, "\n");
}

async function generateGitHubAppJWT(): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error("Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY");
  }

  const normalized = normalizePrivateKey(privateKey);
  const alg = "RS256" as const;
  
  let key;
  
  // Check if it's PKCS#1 (RSA PRIVATE KEY) or PKCS#8 (PRIVATE KEY)
  if (normalized.includes("BEGIN RSA PRIVATE KEY")) {
    // Convert PKCS#1 to PKCS#8 using Node.js crypto module
    try {
      const cryptoKey = createPrivateKey({
        key: normalized,
        format: 'pem',
      });
      
      // Export as PKCS#8 for jose
      const pkcs8Pem = cryptoKey.export({
        format: 'pem',
        type: 'pkcs8'
      }) as string;
      
      key = await importPKCS8(pkcs8Pem, alg);
    } catch (error) {
      console.error("Failed to convert PKCS#1 to PKCS#8:", error);
      throw new Error("Failed to process RSA private key. Please check your GITHUB_APP_PRIVATE_KEY.");
    }
  } else {
    // Assume it's already PKCS#8
    try {
      key = await importPKCS8(normalized, alg);
    } catch (error) {
      console.error("Failed to import PKCS#8 key:", error);
      throw new Error("Failed to import private key. Please check your GITHUB_APP_PRIVATE_KEY format.");
    }
  }
  
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg })
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 9 * 60)
    .setIssuer(appId)
    .sign(key);

  return jwt;
}

// Create axios instance with defaults
const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "StarSling-app",
  },
});

// Private helper for authenticated requests
async function authenticatedRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  const jwt = await generateGitHubAppJWT();
  const response = await githubApi({
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${jwt}`,
    },
  });
  return response.data;
}

// Public API - similar to how supabase/auth clients are structured
export const githubAppClient = {
  installations: {
    /**
     * Get installation details
     */
    async get(installationId: string | number): Promise<GithubInstallation | null> {
      try {
        return await authenticatedRequest<GithubInstallation>({
          method: "GET",
          url: `/app/installations/${installationId}`,
        });
      } catch (error) {
        console.error(`Failed to get installation ${installationId}:`, error);
        return null;
      }
    },

    /**
     * Delete/revoke an installation
     */
    async delete(installationId: string | number): Promise<boolean> {
      try {
        await authenticatedRequest({
          method: "DELETE",
          url: `/app/installations/${installationId}`,
        });
        return true;
      } catch (error: any) {
        // If GitHub returns 404, the installation is already gone
        if (error?.response?.status === 404) {
          return true;
        }
        console.error(`Failed to delete installation ${installationId}:`, error);
        return false;
      }
    },

    /**
     * Get all installations for the app
     */
    async list(): Promise<GithubInstallation[]> {
      try {
        return await authenticatedRequest<GithubInstallation[]>({
          method: "GET",
          url: "/app/installations",
        });
      } catch (error) {
        console.error("Failed to list installations:", error);
        return [];
      }
    },

    /**
     * Get an installation access token
     */
    async getAccessToken(installationId: string | number): Promise<string | null> {
      try {
        const response = await authenticatedRequest<{ token: string }>({
          method: "POST",
          url: `/app/installations/${installationId}/access_tokens`,
        });
        return response.token;
      } catch (error) {
        console.error(`Failed to get access token for installation ${installationId}:`, error);
        return null;
      }
    },
  },
};
