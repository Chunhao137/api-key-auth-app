# Troubleshooting: NextAuth 500 Internal Server Error

## Error Message
```
GET https://your-domain.com/api/auth/error 500 (Internal Server Error)
```

## Common Causes & Solutions

### 1. Missing Environment Variables

**Problem:** Required environment variables are not set in your production environment (Vercel, etc.)

**Solution:**
1. Go to your hosting platform's environment variables settings
2. For Vercel: Project Settings → Environment Variables
3. Make sure these are set:
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-domain.com`)
   - `NEXTAUTH_SECRET` - Your secret key (same as development)
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

4. **Redeploy** your application after adding variables

### 2. Users Table Doesn't Exist

**Problem:** The `users` table hasn't been created in Supabase yet.

**Solution:**
1. Go to your Supabase project: https://app.supabase.com
2. Open **SQL Editor**
3. Copy and paste the contents of `supabase-migration-users-table.sql`
4. Click **Run**
5. Verify the table was created:
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

### 3. Invalid NEXTAUTH_URL

**Problem:** The `NEXTAUTH_URL` doesn't match your actual domain.

**Solution:**
- For production: `NEXTAUTH_URL=https://your-actual-domain.com`
- For development: `NEXTAUTH_URL=http://localhost:3000`
- **No trailing slash!**

### 4. Missing or Invalid Google OAuth Credentials

**Problem:** Google OAuth credentials are missing or incorrect.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Check your OAuth 2.0 Client ID credentials
3. Verify:
   - Client ID is correct
   - Client Secret is correct
   - Authorized redirect URIs include: `https://your-domain.com/api/auth/callback/google`
   - Authorized JavaScript origins include: `https://your-domain.com`

### 5. Supabase Connection Issues

**Problem:** Can't connect to Supabase or credentials are wrong.

**Solution:**
1. Verify Supabase URL format: `https://xxxxx.supabase.co` (no trailing slash)
2. Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the `anon` `public` key (not `service_role`)
3. Test connection in Supabase dashboard
4. Check Supabase project status (not paused)

### 6. NextAuth Secret Issues

**Problem:** `NEXTAUTH_SECRET` is missing or invalid.

**Solution:**
1. Generate a new secret:
   ```bash
   openssl rand -base64 32
   ```
2. Add it to your environment variables
3. Make sure it's the same in both development and production

## Step-by-Step Debugging

### Step 1: Check Server Logs

**Vercel:**
1. Go to your project dashboard
2. Click on **Deployments**
3. Click on the latest deployment
4. Check **Function Logs** or **Runtime Logs**

**Look for:**
- "Missing Supabase environment variables"
- "Error querying user from Supabase"
- "Users table does not exist"
- "Invalid credentials"

### Step 2: Verify Environment Variables

Create a test API route to check variables (remove after debugging):

```typescript
// app/api/test-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}
```

Visit: `https://your-domain.com/api/test-env`

**All should be `true`!**

### Step 3: Test Supabase Connection

1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   SELECT * FROM users LIMIT 1;
   ```
3. If you get "relation 'users' does not exist", run the migration

### Step 4: Test Google OAuth

1. Go to Google Cloud Console
2. Check OAuth consent screen is configured
3. Verify redirect URI matches exactly:
   - Production: `https://your-domain.com/api/auth/callback/google`
   - Development: `http://localhost:3000/api/auth/callback/google`

## Quick Checklist

- [ ] All environment variables are set in production
- [ ] `NEXTAUTH_URL` matches your actual domain (no trailing slash)
- [ ] `NEXTAUTH_SECRET` is set and valid
- [ ] Google OAuth credentials are correct
- [ ] Google OAuth redirect URI includes your production domain
- [ ] Supabase `users` table exists (run migration)
- [ ] Supabase environment variables are correct
- [ ] Application has been redeployed after adding variables

## Common Error Messages

### "Missing Supabase environment variables"
→ Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "relation 'users' does not exist"
→ Run `supabase-migration-users-table.sql` in Supabase SQL Editor

### "Invalid credentials"
→ Check Google OAuth Client ID and Secret

### "Redirect URI mismatch"
→ Add your production domain to Google OAuth authorized redirect URIs

### "NEXTAUTH_SECRET is missing"
→ Generate and add `NEXTAUTH_SECRET` to environment variables

## Still Having Issues?

1. **Check Vercel/Platform Logs:**
   - Look for specific error messages
   - Check function execution logs

2. **Test Locally First:**
   - Make sure it works in development
   - Compare environment variables

3. **Verify Database:**
   - Check Supabase dashboard
   - Verify table structure matches migration

4. **Check Network:**
   - Ensure Supabase is accessible from your hosting platform
   - Check for firewall/network restrictions

