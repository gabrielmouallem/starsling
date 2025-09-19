# StarSling - GitHub Integration Takehome Project

StarSling is "Cursor for DevOps". We build agents that can perform actions like debugging issues, managing deployments, or resolving incidents autonomously.

This takehome project tests your ability to build a new Next.js application with a PostgreSQL database and implement a GitHub App integration. You'll use BetterAuth for user authentication via GitHub OAuth (for user sign-in) and create a separate GitHub App integration for task synchronization.

This is actually the first thing that we hacked together when building StarSling. We know that it can be completed in under 6 hours as a hackathon style project and even faster if you use codegeneration tools. You have _4 days_ to complete the project since we know that it can be hard to find dedicated focus time when working full time.

## Project Overview

Your task is to create a Next.js application from scratch that:

- Users can sign-up and login using a GitHub account.
- After signed in, users can integrate with a GitHub App. (Using the integration for anything else isn't in the scope of the takehome. If you are curious, we use our Github App intergration to fetch data about customers repos and deployments)
- Stores data in a PostgreSQL database.
- Processes GitHub events about the app installation via webhooks
- Displays GitHub integration status on an integrations page.

## Requirements

### Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: PostgreSQL (use any hosted solution like Supabase, or local PostgreSQL)
- **Authentication**: BetterAuth with GitHub OAuth for user sign-in
- **Background Jobs**: Inngest for webhook and cron-based processing
- **Styling**: Tailwind CSS
- **Deployment**: Instructions for local development (deployment to Vercel is optional)

### Setup Instructions

1. **Initialize the Project**

   - Create a new Next.js project with TypeScript.
   - Set up a PostgreSQL database (local or hosted).
   - Install dependencies: `better-auth`, `inngest`, `pg` (or another PostgreSQL client), and other necessary packages.

2. **Database Schema**

   - Use Better-Auth to set up the tables required for users to sign-in with a Github account. (social sign-in)
   - Create a `integration_installations` table
     - Stores GitHub App installation data (id, organization_id, provider, access_token, refresh_token, metadata [JSONB], created_at, updated_at).

3. **Authentication - Github Oauth App Social Sign-In**

   - Use BetterAuth to implement GitHub OAuth for user sign-in.
   - After sign-in, the user can create an organization. (Better-Auth has a plugin for this)

4. **GitHub App Integration**

   - Create a GitHub App via the GitHub Developer Settings ([https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app)).
   - Configure the app with:
     - **Name**: "StarSling GitHub Test"
     - **Callback URL**: `https://[YOUR_APP_URL]/api/github/callback`
     - **Webhook URL**: `https://[YOUR_APP_URL]/api/github/webhook`
     - **Permissions**: Issues (read/write), Metadata (read)
     - **Webhook Events**: Subscribe to `issues` events (opened, edited, closed, reopened).
   - Save the GitHub App's client ID, client secret, and private key to environment variables.
   - Implement OAuth flow for organization-level installation (not user-level).

5. **Integration Installation Flow**

   - Create routes:
     - `/api/github/auth`: Initiates OAuth flow, redirecting to GitHub.
     - `/api/github/callback`: Handles OAuth callback, exchanges code for tokens, and stores installation data.
   - Validate access tokens with the GitHub API before storing.
   - Store tokens securely, encrypted at rest using a library like `crypto`.
   - Save installation data in `integration_installations` (access_token, refresh_token, metadata).

6. **Webhook Handling (Push)**

   - Create a webhook endpoint: `/api/github/webhook`.
   - Verify webhook signatures using the GitHub webhook secret.
   - Handle Github App installation events.
   - Use Inngest to process events in the background.

7. **Uninstall & Deletion**

   - Handle uninstall webhooks from GitHub.
   - When an integration is uninstalled or disconnected via the UI:
     - Remove the corresponding row in `integration_installations`.
     - Revoke tokens via the GitHub API if supported.

8. **Integrations Page**
   - Create a `/integrations` page displaying a GitHub integration card.
   - Show connection status (connected/disconnected) and a "Connect" button.
   - Handle cases:
     - New installation: Initiates Github App oauth flow.
     - Existing installation in another organization: Show a warning.

### Definition of Done

- [x] The Next.js app is fully functional locally with a PostgreSQL database.
- [x] Users can sign in at `/login` via a GitHub OAuth app using Better-Auth.
- [ ] The GitHub App integration works end-to-end:
  - [ ] OAuth flow installs the app at the organization level.
  - [ ] Webhooks and inngest functions process integration installation events table.
  - [ ] Uninstalling removes integration data correctly.
- [ ] The `/integrations` page shows a GitHub card with connection status.
- [ ] Tokens are encrypted at rest.
- [ ] No duplicate issues in the `items` table; updates modify existing rows.
- [ ] The app is secure, with proper webhook signature verification and token handling.

## Final Result

Include a `README.md` with setup instructions and a brief explanation of your approach. It should be easy for us to run your codebase with a few commands.

For example your instructions might look like:

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up PostgreSQL database (local or hosted)
# Update .env.local with database credentials and GitHub App credentials
pnpm db:seed

# Start development server
pnpm dev
```

## Submission

- Provide a GitHub repository with the complete codebase.
- Ensure the app runs locally with clear instructions for setting up the database and environment variables.
- (Optional) Deploy to Vercel and provide a live URL.

## Resources

- **BetterAuth**: [https://better-auth.com/docs](https://better-auth.com/docs)
- **GitHub App Docs**: [https://docs.github.com/en/apps/creating-github-apps](https://docs.github.com/en/apps/creating-github-apps)
- **GitHub API**: [https://docs.github.com/en/rest](https://docs.github.com/en/rest)
- **Inngest**: [https://www.inngest.com/docs](https://www.inngest.com/docs)
