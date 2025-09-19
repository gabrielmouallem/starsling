import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Simple encryption/decryption functions using Node.js crypto
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET!;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  // If already encrypted (contains a colon and the first part is a valid hex IV of length 32)
  if (typeof text === "string") {
    const parts = text.split(":");
    if (
      parts.length === 2 &&
      /^[a-f0-9]{32}$/i.test(parts[0]) &&
      parts[1].length > 0
    ) {
      return text; // Already encrypted
    }
  }
  const key = scryptSync(ENCRYPTION_SECRET, 'salt', 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(maybeEncryptedText: string): string {
  try {
    const parts = maybeEncryptedText.split(":");
    const looksEncrypted = parts.length === 2 && /^[a-f0-9]{32}$/i.test(parts[0]) && parts[1].length > 0;
    if (!looksEncrypted) {
      return maybeEncryptedText; // treat as plaintext
    }
    const key = scryptSync(ENCRYPTION_SECRET, 'salt', 32);
    const [ivHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return maybeEncryptedText; // fail-safe passthrough
  }
}

export const auth = betterAuth({
  baseURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`,
  database: new Pool({
    connectionString: process.env.SUPABASE_DB_CONN_URI!,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    account: {
      create: {
        async before(account, _context) {
          const withEncryptedTokens = { ...account };
          
          // Encrypt access token if present
          if (account.accessToken) {
            withEncryptedTokens.accessToken = encrypt(account.accessToken);
          }
          
          // Encrypt refresh token if present
          if (account.refreshToken) {
            withEncryptedTokens.refreshToken = encrypt(account.refreshToken);
          }
          
          return {
            data: withEncryptedTokens
          };
        },
      },
      update: {
        async before(account, _context) {
          const withEncryptedTokens = { ...account };
          
          // Encrypt access token if present and being updated
          if (account.accessToken) {
            withEncryptedTokens.accessToken = encrypt(account.accessToken);
          }
          
          // Encrypt refresh token if present and being updated
          if (account.refreshToken) {
            withEncryptedTokens.refreshToken = encrypt(account.refreshToken);
          }
          
          return {
            data: withEncryptedTokens
          };
        },
      },
    },
  },
});

// Export helpers for encrypting/decrypting provider tokens at rest
export { encrypt, decrypt };