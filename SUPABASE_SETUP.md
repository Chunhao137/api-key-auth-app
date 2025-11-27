# Supabase Setup Guide

This guide will help you connect your API key dashboard to a Supabase database.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details and wait for the database to be created

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 3: Create the Database Table

1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase-schema.sql` from this project
4. Click "Run" to execute the SQL

This will create:
- The `api_keys` table with all necessary columns
- Indexes for better query performance
- Row Level Security (RLS) policies (currently allowing all operations)
- A trigger to automatically update the `updated_at` timestamp

## Step 4: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from Step 2.

**Important:** Never commit `.env.local` to version control. It should already be in `.gitignore`.

## Step 5: Restart Your Development Server

If your Next.js dev server is running, restart it to load the new environment variables:

```bash
npm run dev
```

## Step 6: Test the Integration

1. Navigate to `/dashboards` in your app
2. Try creating a new API key
3. Verify it appears in the table
4. Test editing, rotating, revoking, and deleting keys

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure `.env.local` exists in the project root
- Verify the variable names are exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

### "relation 'api_keys' does not exist" error

- Make sure you ran the SQL schema from `supabase-schema.sql` in the Supabase SQL Editor
- Check that the table was created in the correct database

### RLS Policy Errors

- The default policy allows all operations for simplicity
- In production, you should update the RLS policies to restrict access based on user authentication

## Next Steps

- **Add Authentication**: Integrate Supabase Auth to associate API keys with specific users
- **Update RLS Policies**: Restrict access so users can only see/modify their own keys
- **Add Usage Tracking**: Implement logic to increment `usage_count` when API keys are used
- **Add Rate Limiting**: Use the `monthly_limit` field to enforce usage limits

