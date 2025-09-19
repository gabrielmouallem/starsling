import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  baseURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api`,
  database: new Pool({
    connectionString: process.env.SUPABASE_DB_CONN_URI!,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});