# Troubleshooting: "Invalid supabaseUrl" Error

## Error Message
```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

## Common Causes & Solutions

### 1. Missing `https://` Protocol

**Problem:** The URL doesn't start with `https://`

**Wrong:**
```env
NEXT_PUBLIC_SUPABASE_URL=xxxxx.supabase.co
```

**Correct:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

### 2. Extra Spaces or Quotes

**Problem:** The URL has extra spaces or quotes around it

**Wrong:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_URL= https://xxxxx.supabase.co 
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co 
```

**Correct:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

### 3. Empty or Undefined Variable

**Problem:** The environment variable is empty or not set

**Check:**
1. Open `.env.local` in the root of your `charles-app` directory
2. Make sure the line exists and has a value:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   ```

### 4. Wrong File Location

**Problem:** `.env.local` is in the wrong location

**Solution:**
- The file must be in the **root** of `charles-app` directory
- Same level as `package.json`
- Path should be: `charles-app/.env.local`

### 5. Dev Server Not Restarted

**Problem:** You added the variable but didn't restart the server

**Solution:**
1. Stop your dev server (Ctrl+C or Cmd+C)
2. Restart it:
   ```bash
   yarn dev
   ```

### 6. Typo in Variable Name

**Problem:** The variable name is misspelled

**Wrong:**
```env
NEXT_PUBLIC_SUPABASE_UR=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

**Correct:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

## Step-by-Step Fix

1. **Open `.env.local`** in your project root

2. **Check your URL format**. It should look exactly like this:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   ```

3. **Verify:**
   - ✅ Starts with `https://`
   - ✅ No quotes around the value
   - ✅ No spaces before or after the `=`
   - ✅ No spaces at the end of the URL
   - ✅ Variable name is exactly `NEXT_PUBLIC_SUPABASE_URL`

4. **Get the correct URL from Supabase:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **API**
   - Copy the **Project URL** (it should already include `https://`)

5. **Restart your dev server:**
   ```bash
   # Stop the server
   # Then restart
   yarn dev
   ```

## Example of Correct `.env.local` File

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Quick Test

To verify your URL is correct, you can test it in your browser:
1. Copy the URL from your `.env.local` file
2. Paste it in your browser's address bar
3. If it loads (even if it shows an error page), the URL format is correct
4. If your browser says "Invalid URL", then the format is wrong

## Still Having Issues?

1. **Double-check the Supabase dashboard:**
   - Make sure you copied the URL from Settings → API
   - The URL should be visible in a text box, not just displayed

2. **Check for hidden characters:**
   - Try deleting the line and retyping it
   - Make sure you're not copying extra whitespace

3. **Verify file encoding:**
   - Make sure `.env.local` is saved as a plain text file
   - Not as a Word document or rich text

4. **Check console output:**
   - The error message should now show what URL it received
   - This will help you see if there are extra characters

