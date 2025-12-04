# NextAuth Google SSO Setup Guide

This guide will walk you through setting up Google Single Sign-On (SSO) with NextAuth in your application.

## Step 1: Generate NextAuth Secret

Generate a secure random secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for the `NEXTAUTH_SECRET` environment variable.

## Step 2: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing project
   - Give it a name (e.g., "Charles App")
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in the required fields:
       - App name: Your app name
       - User support email: Your email
       - Developer contact information: Your email
     - Click "Save and Continue" through the scopes (default is fine)
     - Click "Save and Continue" for test users (add your email if needed)
     - Click "Back to Dashboard"

5. **Create OAuth Client ID**
   - Application type: "Web application"
   - Name: "Charles App Web Client" (or any name)
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production - add this later)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production - add this later)
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with your Client ID and Client Secret
   - **Copy both values** - you won't be able to see the secret again!
   - If you missed it, you can create a new one or reset the secret

## Step 3: Set Up Environment Variables

1. **Create `.env.local` file** in the root of your project (if it doesn't exist)

2. **Add the following variables:**

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-from-step-1

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-from-google-console.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-console

# Your existing Supabase variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Replace the placeholder values:**
   - `NEXTAUTH_SECRET`: Use the secret you generated in Step 1
   - `GOOGLE_CLIENT_ID`: Your Google Client ID from Step 2
   - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret from Step 2

## Step 4: Create Users Table in Supabase

1. **Go to your Supabase project**
   - Visit: https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the users table migration**
   - Copy and paste the contents of `supabase-users-table.sql` from this project
   - Click "Run" to execute the SQL

   This will create:
   - The `users` table to store user information from Google SSO
   - Indexes for faster lookups
   - Row Level Security (RLS) policies
   - A trigger to automatically update the `updated_at` timestamp

   **Note:** When a user logs in for the first time, their details (email, name, image, provider info) will be automatically saved to this table.

## Step 5: Install Dependencies

The NextAuth package should already be installed. If not, run:

```bash
yarn add next-auth
```

## Step 6: Test the Setup

1. **Start your development server:**
   ```bash
   yarn dev
   ```

2. **Visit your app:**
   - Go to http://localhost:3000
   - You should see a "Sign in with Google" button

3. **Test the login:**
   - Click "Sign in with Google"
   - You'll be redirected to Google's login page
   - Sign in with your Google account
   - You'll be redirected back to your app
   - You should see your profile picture and name, with a "Sign Out" button

## Step 7: Production Setup

When deploying to production:

1. **Update Google OAuth Credentials:**
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add your production domain to:
     - Authorized JavaScript origins: `https://yourdomain.com`
     - Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`
   - Save the changes

2. **Update Environment Variables:**
   - In your hosting platform (Vercel, Netlify, etc.), add environment variables:
     - `NEXTAUTH_URL=https://yourdomain.com`
     - `NEXTAUTH_SECRET` (same as development)
     - `GOOGLE_CLIENT_ID` (same as development)
     - `GOOGLE_CLIENT_SECRET` (same as development)

## Troubleshooting

### "Invalid credentials" error
- Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing environment variables

### Redirect URI mismatch
- Ensure the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check that `NEXTAUTH_URL` matches your actual URL

### "NEXTAUTH_SECRET is missing"
- Make sure you've added `NEXTAUTH_SECRET` to your `.env.local` file
- Restart your dev server

### Session not persisting
- Check that cookies are enabled in your browser
- Verify `NEXTAUTH_URL` is set correctly

## Files Created

The following files were created for this setup:

- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler with Supabase integration
- `lib/auth.ts` - Server-side auth utilities and Supabase user helpers
- `components/providers/session-provider.tsx` - Client-side session provider
- `components/auth/login-button.tsx` - Login/logout button component
- `supabase-users-table.sql` - SQL migration to create users table
- `types/next-auth.d.ts` - TypeScript type definitions
- `.env.example` - Environment variables template

## User Data Storage

When a user logs in for the first time with Google SSO:

1. **User details are automatically saved to Supabase** in the `users` table:
   - Email address
   - Name
   - Profile image URL
   - Provider (Google)
   - Provider ID (Google user ID)
   - Created timestamp
   - Last login timestamp

2. **On subsequent logins**, the `last_login_at` timestamp is updated.

3. **You can query user data** using the `getUserFromSupabase()` function from `lib/auth.ts`:
   ```typescript
   import { getUserFromSupabase } from "@/lib/auth";
   
   const user = await getUserFromSupabase("user@example.com");
   ```

## Next Steps

- Protect routes by checking session in server components or API routes
- Use `getSession()` from `lib/auth.ts` in server components
- Use `useSession()` hook in client components
- Query user data from Supabase using `getUserFromSupabase()`
- Customize the login experience in `components/auth/login-button.tsx`
- Link API keys to users by adding a `user_id` column to the `api_keys` table

