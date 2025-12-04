# How to Retrieve Supabase Environment Variables

This guide shows you how to get the Supabase environment variables needed for your `.env.local` file (lines 12-13).

## What You Need

You need these two environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## Step-by-Step Instructions

### Step 1: Log in to Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with your account
3. If you don't have an account, click "Start your project" to create one

### Step 2: Select or Create Your Project

1. **If you already have a project:**
   - Click on your project from the dashboard
   - Skip to Step 3

2. **If you need to create a new project:**
   - Click "New Project" button
   - Fill in the project details:
     - **Name**: Give your project a name (e.g., "Charles App")
     - **Database Password**: Create a strong password (save this securely!)
     - **Region**: Choose the region closest to you
     - **Pricing Plan**: Select "Free" for development
   - Click "Create new project"
   - Wait 1-2 minutes for the project to be set up

### Step 3: Access Project Settings

1. In your Supabase project dashboard, look at the left sidebar
2. Click on **Settings** (gear icon at the bottom)
3. Click on **API** in the settings menu

### Step 4: Find Your Environment Variables

On the API settings page, you'll see several sections:

#### Finding `NEXT_PUBLIC_SUPABASE_URL` (Project URL)

1. Look for the **Project URL** section
2. You'll see a URL that looks like:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
3. **Copy this entire URL** - this is your `NEXT_PUBLIC_SUPABASE_URL`

#### Finding `NEXT_PUBLIC_SUPABASE_ANON_KEY` (API Key)

1. Look for the **Project API keys** section
2. You'll see several keys listed:
   - `anon` `public` - This is the one you need!
   - `service_role` `secret` - **DO NOT use this one** (it has admin privileges)
3. Find the key labeled `anon` and `public`
4. Click the **eye icon** 👁️ or **copy icon** 📋 next to it to reveal/copy the key
5. **Copy this key** - this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 5: Add to Your `.env.local` File

1. Open or create `.env.local` in the root of your `charles-app` directory
2. Add these lines (replace with your actual values):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

**Important Notes:**
- Replace `https://xxxxxxxxxxxxx.supabase.co` with your actual Project URL
- Replace the long `eyJhbGc...` string with your actual anon key
- Make sure there are **no spaces** around the `=` sign
- Don't add quotes around the values
- Never commit `.env.local` to git (it should be in `.gitignore`)

### Step 6: Verify Your Setup

1. **Restart your development server** if it's running:
   ```bash
   # Stop the server (Ctrl+C) and restart
   yarn dev
   ```

2. **Test the connection** by checking if your app can connect to Supabase:
   - Try accessing a page that uses Supabase
   - Check the browser console for any errors
   - If you see "Missing Supabase environment variables", double-check your `.env.local` file

## Visual Guide

Here's what the Supabase API settings page looks like:

```
┌─────────────────────────────────────────┐
│  Settings > API                          │
├─────────────────────────────────────────┤
│                                          │
│  Project URL                            │
│  ┌───────────────────────────────────┐  │
│  │ https://xxxxx.supabase.co         │  │  ← Copy this
│  └───────────────────────────────────┘  │
│                                          │
│  Project API keys                        │
│  ┌───────────────────────────────────┐  │
│  │ anon        public                │  │
│  │ eyJhbGc...  [👁️] [📋]            │  │  ← Copy this
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ service_role  secret              │  │  ← Don't use this!
│  │ eyJhbGc...  [👁️] [📋]            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Troubleshooting

### "Missing Supabase environment variables" Error

**Problem:** Your app can't find the Supabase environment variables.

**Solutions:**
1. Make sure `.env.local` is in the **root** of your `charles-app` directory (same level as `package.json`)
2. Check that variable names are **exactly**:
   - `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
3. Make sure there are **no typos** in the variable names
4. **Restart your dev server** after adding/changing environment variables
5. Check that there are no extra spaces or quotes

### "Invalid API key" Error

**Problem:** The anon key you're using is incorrect.

**Solutions:**
1. Go back to Supabase Settings > API
2. Make sure you copied the `anon` `public` key, not the `service_role` key
3. Copy the key again (make sure you got the entire key)
4. Check that you didn't accidentally add any spaces or line breaks

### Can't Find the API Settings

**Problem:** You can't locate the API settings page.

**Solutions:**
1. Make sure you're logged into the correct Supabase account
2. Make sure you've selected the correct project
3. Look for the **Settings** icon (gear ⚙️) in the left sidebar
4. Click on **API** in the settings submenu

## Security Best Practices

1. **Never commit `.env.local` to git** - It should already be in `.gitignore`
2. **Use the `anon` key, not `service_role`** - The service_role key has admin access
3. **Don't share your keys publicly** - Keep them private
4. **Rotate keys if compromised** - You can regenerate keys in Supabase settings
5. **Use different keys for development and production** - Create separate Supabase projects if needed

## Quick Reference

**File Location:** `.env.local` in the root of `charles-app`

**Lines 12-13 should contain:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find them:**
- Supabase Dashboard → Your Project → Settings → API
- Look for "Project URL" and "anon public" key

